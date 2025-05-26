from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
import tempfile, os
from typing import Optional, List
from services.backend.schemas import( 
    CurrentBattery, 
    BatteryAnalyticDataSchema, 
    ChartBatteryDataSchema, 
    CurrentSollarPanels, 
    SolarPanelAnalyticDataSchema, 
    ChartSolarPanelDataSchema
    )
from services.backend.controllers import (
    get_brands,
    get_suppliers,
    get_current_batteries,
    battery_ai_analytic,
    ai_battery_chart,
    get_battery_price_comparison_data,
    get_current_solar_panels,
    solar_panel_ai_analytic,
    ai_sollar_panels_chart,
    get_sollar_panel_price_comparison_data
    )


router = APIRouter(prefix="", tags=["backend"])

@router.get("/batteries/brands")
async def get_current_brands():
    brands = await get_brands()
    return {"brands": brands}


@router.get("/batteries/suppliers")
async def get_current_suppliers():
    suppliers = await get_suppliers()
    return {"suppliers": suppliers}


@router.post("/batteries/current_batteries")
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


@router.post("/batteries/analytics")
async def get_battery_analytics(data: BatteryAnalyticDataSchema):
    return await battery_ai_analytic(data)


@router.post("/batteries/chart")
async def get_battery_chart(data: ChartBatteryDataSchema):
    return await ai_battery_chart(data)

@router.get("/batteries/price_comparison")
async def get_battery_price_comparison():
    return await get_battery_price_comparison_data()

@router.get("/solar_panels/brands")
async def get_solar_panels_brands():
    brands = await get_brands(product_type="solar_panels")
    return {"brands": brands}

@router.get("/solar_panels/suppliers")
async def get_solar_panels_suppliers():
    suppliers = await get_suppliers(product_type="solar_panels")
    return {"suppliers": suppliers}


@router.post("/solar_panels/current_solar_panels")
async def get_current_solar_panels_data(data: CurrentSollarPanels):
    sollar_panels = await get_current_solar_panels(
        brand_ids=data.brand_ids,
        supplier_ids=data.supplier_ids,
        power=data.power,
        panel_type=data.panel_type,
        cell_type=data.cell_type,
        thickness=data.thickness,
        price_per_w=data.price_per_w,
        page=data.page,
        page_size=data.page_size,
        price_diapason=data.price_diapason,
        sort_by=data.sort_by,
        sort_order=data.sort_order,
    )
    return sollar_panels

@router.post("/solar_panels/analytics")
async def get_sollar_panels_analytics(data: SolarPanelAnalyticDataSchema):
    return await solar_panel_ai_analytic(data)

@router.post("/solar_panels/chart")
async def get_sollar_panels_chart(data: ChartSolarPanelDataSchema):
    return await ai_sollar_panels_chart(data)

@router.get("/solar_panels/price_comparison")
async def get_sollar_panels_price_comparison():
    return await get_sollar_panel_price_comparison_data()

# Ендпоінти для парсерів акумуляторів
@router.post("/upload_batteries/ai_upload/parse_competitor")
async def parse_competitor_batteries_endpoint():
    result = await parse_competitor_batteries()
    return {"status": "success", "message": "Парсер конкурентів акумуляторів запущено успішно", "data": result}

@router.post("/upload_batteries/ai_upload/parse_me")
async def parse_me_batteries_endpoint():
    result = await parse_me_batteries()
    return {"status": "success", "message": "Парсер наших цін на акумулятори запущено успішно", "data": result}

# Ендпоінти для парсерів сонячних панелей
@router.post("/upload_solar_panels/ai_upload/parse_competitor")
async def parse_competitor_solar_panels_endpoint():
    result = await parse_competitor_solar_panels()
    return {"status": "success", "message": "Парсер конкурентів сонячних панелей запущено успішно", "data": result}

@router.post("/upload_solar_panels/ai_upload/parse_me")
async def parse_me_solar_panels_endpoint():
    result = await parse_me_solar_panels()
    return {"status": "success", "message": "Парсер наших цін на сонячні панелі запущено успішно", "data": result}
