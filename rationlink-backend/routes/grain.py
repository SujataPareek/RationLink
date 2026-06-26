from fastapi import APIRouter, File, UploadFile, HTTPException, Query
from core.grain_cv import analyze_grain_image
from database import get_conn

router = APIRouter()

@router.post("/grain/analyze")
async def analyze_grain(
    user_id: str = Query("anonymous", description="ID of beneficiary or operator"),
    file: UploadFile = File(...)
):
    """
    Receives an uploaded grain image, runs OpenCV contour and color analysis,
    saves the report in SQLite database, and returns analysis metrics.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
        
    try:
        contents = await file.read()
        result = analyze_grain_image(contents)
        if not result.get("success", False):
            raise HTTPException(status_code=400, detail=result.get("error", "Analysis failed"))
        
        # Save report locally to SQLite
        conn = get_conn()
        cur  = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO grain_reports 
                (user_id, total_grains, good_grains, broken_grains, impurities, purity_pct, grade, synced)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0)
            """, (
                user_id,
                result.get("total_count", 0),
                result.get("good_count", 0),
                result.get("broken_count", 0),
                result.get("impurity_count", 0),
                round(100.0 - result.get("impurity_pct", 0.0), 1),
                result.get("grade", "GOOD")
            ))
            conn.commit()
        except Exception as dbe:
            print(f"[SQLite Error] Failed to save grain report: {dbe}")
        finally:
            conn.close()

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error during analysis: {str(e)}")
