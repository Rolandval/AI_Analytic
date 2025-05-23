from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
import tempfile, os
from typing import Optional, List
from services.backend.schemas import CurrentBattery, AnalyticDataSchema, ChartDataSchema
from services.backend.controllers import (
    get_brands,
    get_suppliers,
    get_current_batteries,
    ai_analytic,
    ai_chart,
    get_price_comparison_data
    )


router = APIRouter(prefix="/batteries", tags=["batteries"])

@router.get("/brands")
async def get_current_brands():
    brands = await get_brands()
    return {"brands": brands}


@router.get("/suppliers")
async def get_current_suppliers():
    suppliers = await get_suppliers()
    return {"suppliers": suppliers}


@router.post("/current_batteries")
async def get_current_batteries_data(data: CurrentBattery):
    batteries = await get_current_batteries(
        brand_ids=data.brand_ids,
        supplier_ids=data.supplier_ids,
        volumes=data.volumes,
        polarities=data.polarities,
        regions=data.regions,
        electrolytes=data.electrolytes,
        c_amps=data.c_amps,
        page=data.page,
        page_size=data.page_size,
        price_diapason=data.price_diapason,
        sort_by=data.sort_by,
        sort_order=data.sort_order,
    )
    return batteries


@router.post("/analytics")
async def get_analytics(data: AnalyticDataSchema):
    return await ai_analytic(data)


@router.post("/chart")
async def get_chart(data: ChartDataSchema):
    return await ai_chart(data)

@router.get("/price_comparison")
async def get_price_comparison():
    return await get_price_comparison_data()