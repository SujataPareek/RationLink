from fastapi import APIRouter
from core.ml_predictor import predict_demand, predict_all_areas

router = APIRouter()

@router.get("/predict/demand/{area}")
def demand_by_area(area: str):
    return predict_demand(area)

@router.get("/predict/all")
def demand_all():
    return predict_all_areas()
