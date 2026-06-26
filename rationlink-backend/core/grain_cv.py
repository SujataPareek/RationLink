import cv2
import numpy as np
import base64

def analyze_grain_image(image_bytes: bytes) -> dict:
    """
    Analyzes grain image using OpenCV.
    - Segment grains using Otsu's thresholding.
    - Detect contours to count total items.
    - Measure area and circularity/aspect ratio of contours to classify:
        - Full Grains
        - Broken Grains
        - Foreign Impurities (stones, dust, non-grain particles)
    - Returns analysis metrics and a base64-encoded annotated image.
    """
    import logging
    logger = logging.getLogger("rationlink.cv")
    try:
        # 1. Decode image bytes
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {
                "error": "Invalid image data. Could not decode image.",
                "success": False
            }
            
        # Resize to standard size for consistent analysis
        h, w = img.shape[:2]
        max_dim = 640
        if max(h, w) > max_dim:
            scale = max_dim / max(h, w)
            img = cv2.resize(img, (int(w * scale), int(h * scale)))
            h, w = img.shape[:2]

        # Save a copy for drawing overlays
        overlay = img.copy()

        # 2. Preprocess & Segment
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Otsu's thresholding to segment grains from background
        # We assume a relatively dark/neutral background (e.g. dark blue, black, or grey) or a light background.
        # To handle general cases, we can check if the background is light or dark.
        # Let's assume standard PDS inspections are done on a dark tray (standard practice for CV analysis).
        # If the average of the edges is high, invert thresholding.
        edge_mean = np.mean([gray[0, :], gray[-1, :], gray[:, 0], gray[:, -1]])
        if edge_mean > 127:
            # Light background: grains are darker than background
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        else:
            # Dark background: grains are lighter than background
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Clean up noise using morphological operations (opening)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)

        # 3. Find Contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        total_count = 0
        good_grains = 0
        broken_grains = 0
        impurities = 0
        
        # Analyze grain sizes
        # First, calculate average size of grains to dynamically set thresholds
        areas = []
        for c in contours:
            area = cv2.contourArea(c)
            if area > 15:  # filter tiny noise
                areas.append(area)
                
        if len(areas) == 0:
            return {
                "success": True,
                "grade": "N/A",
                "impurity_pct": 0,
                "total_count": 0,
                "good_count": 0,
                "broken_count": 0,
                "impurity_count": 0,
                "message": "No grains detected. Please place a grain sample in view.",
                "overlay_img": ""
            }
            
        median_area = np.median(areas)
        
        # Color thresholding in HSV to identify non-grain colors (e.g., green, blue, dark black stones)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        for c in contours:
            area = cv2.contourArea(c)
            if area < 15:
                continue  # Noise
                
            total_count += 1
            
            # Calculate circularity/aspect ratio
            perimeter = cv2.arcLength(c, True)
            circularity = 4 * np.pi * area / (perimeter * perimeter) if perimeter > 0 else 0
            
            # Get bounding box info
            x, y, cw, ch = cv2.boundingRect(c)
            aspect_ratio = float(cw) / ch if ch > 0 else 1.0
            
            # Color Analysis inside contour
            mask = np.zeros(gray.shape, dtype=np.uint8)
            cv2.drawContours(mask, [c], -1, 255, -1)
            mean_val = cv2.mean(img, mask=mask)[:3]
            mean_hsv = cv2.mean(hsv, mask=mask)[:3]
            
            # Define grain color profiles (Rice is typically white/yellowish, wheat is brownish-yellow)
            # Rice/Wheat HSV Hue is typically 10-35 (orange/yellow/brown) or high brightness
            # If Hue is green (35-85) or blue (85-130), or Saturation is very high and it's dark (impurity)
            is_impurity = False
            
            # Simple heuristic for non-grain impurities (e.g., plastic, black stones, dark husk)
            # Hue outside 5-45, or extremely dark/saturated
            h_val, s_val, v_val = mean_hsv[0], mean_hsv[1], mean_hsv[2]
            
            # Stones/dirt: very dark (V < 50) or gray/black
            if v_val < 50:
                is_impurity = True
            # Colored objects (e.g., thread, plastic, blue/green particles)
            elif (h_val > 45 and h_val < 135) and s_val > 50:
                is_impurity = True
                
            if is_impurity:
                impurities += 1
                # Draw red rectangle for impurities
                cv2.drawContours(overlay, [c], -1, (0, 0, 255), 2)
                cv2.putText(overlay, "Stone", (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 255), 1)
            # Broken grains: significantly smaller than median grain size (e.g., < 50% of median area)
            elif area < median_area * 0.55:
                broken_grains += 1
                # Draw yellow rectangle for broken grains
                cv2.drawContours(overlay, [c], -1, (0, 255, 255), 2)
                cv2.putText(overlay, "Broken", (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)
            else:
                good_grains += 1
                # Draw green rectangle for good grains
                cv2.drawContours(overlay, [c], -1, (0, 255, 0), 2)
                cv2.putText(overlay, "OK", (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)

        # 4. Determine Grade
        impurity_pct = round((impurities + broken_grains * 0.5) / max(total_count, 1) * 100, 1)
        
        if impurity_pct > 15:
            grade = "POOR"  # Reject
        elif impurity_pct > 6:
            grade = "MODERATE"  # Marginal
        else:
            grade = "GOOD"  # Acceptable
            
        # 5. Encode Overlay Image
        _, buffer = cv2.imencode('.jpg', overlay)
        overlay_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return {
            "success": True,
            "grade": grade,
            "impurity_pct": impurity_pct,
            "total_count": total_count,
            "good_count": good_grains,
            "broken_count": broken_grains,
            "impurity_count": impurities,
            "message": f"Analysis complete: {good_grains} good grains, {broken_grains} broken grains, {impurities} impurities detected.",
            "overlay_img": f"data:image/jpeg;base64,{overlay_base64}"
        }
    except Exception as e:
        logger.error(f"Failed to analyze grain image: {e}", exc_info=True)
        return {
            "success": False,
            "error": f"Computer Vision analysis failed: {str(e)}",
            "grade": "ERROR",
            "impurity_pct": 0.0,
            "total_count": 0,
            "good_count": 0,
            "broken_count": 0,
            "impurity_count": 0,
            "message": f"Computer Vision analysis failed: {str(e)}",
            "overlay_img": ""
        }
