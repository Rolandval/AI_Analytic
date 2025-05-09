from sqlalchemy import create_engine, text
from sqlalchemy.orm import joinedload
from typing import Callable, List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import Query
from db.database import SessionLocal
from db.models import Batteries, CurrentBatteries, Brands, Suppliers
from services.backend.schemas import SortEnumModel, SortOrderEnumModel, AnalyticDataSchema, ChartDataSchema
from datetime import datetime
from helpers.brand import get_or_create_brand
from helpers.prompt import analytics_prompt
from helpers.ai_charts import get_chart_data
from helpers.charts import plot_combined_price_chart

async def get_brands():
    session = SessionLocal()
    result = await session.execute(select(Brands))
    await session.close()
    return result.scalars().all()

async def get_suppliers():
    session = SessionLocal()
    result = await session.execute(select(Suppliers))
    await session.close()
    return result.scalars().all()


async def get_current_batteries(
    brand_ids: Optional[List[int]] = None,
    supplier_ids: Optional[List[int]] = None,
    volumes: Optional[List[float]] = None,
    polarities: Optional[List[str]] = None,
    c_amps: Optional[List[int]] = None,
    price_diapason: Optional[List[int]] = None,
    page: int = 1,
    page_size: int = 10,
    sort_by: SortEnumModel = SortEnumModel.price,
    sort_order: SortOrderEnumModel = SortOrderEnumModel.desc,
    ):
    session = SessionLocal()
    query = select(CurrentBatteries)
    if len(brand_ids) != 0 and brand_ids is not None and brand_ids != [0]:
        query = query.filter(CurrentBatteries.brand_id.in_(brand_ids))
    if len(supplier_ids) != 0 and supplier_ids is not None and supplier_ids != [0]:
        query = query.filter(CurrentBatteries.supplier_id.in_(supplier_ids))
    if len(volumes) != 0 and volumes is not None and volumes != [0]:
        query = query.filter(CurrentBatteries.volume.in_(volumes))
    if len(polarities) != 0 and polarities is not None and polarities != ["string"]:
        query = query.filter(CurrentBatteries.polarity.in_(polarities))
    if len(c_amps) != 0 and c_amps is not None and c_amps != [0]:
        query = query.filter(CurrentBatteries.c_amps.in_(c_amps))
    if price_diapason is not None and price_diapason != [0]:
        query = query.filter(CurrentBatteries.price.between(price_diapason[0], price_diapason[1]))

    # Сортування
    if sort_by == SortEnumModel.price:
        sort_column = CurrentBatteries.price
    elif sort_by == SortEnumModel.c_amps:
        sort_column = CurrentBatteries.c_amps
    elif sort_by == SortEnumModel.volume:
        sort_column = CurrentBatteries.volume
    else:
        sort_column = CurrentBatteries.price  # За замовчуванням
    
    # Напрямок сортування
    if sort_order == SortOrderEnumModel.asc:
        query = query.order_by(sort_column.asc())
    else:  # desc
        query = query.order_by(sort_column.desc())

    # Пагінація
    query = query.offset((page - 1) * page_size).limit(page_size)

    query = query.options(
        joinedload(CurrentBatteries.brand),
        joinedload(CurrentBatteries.supplier)
    )
    result_data = await session.execute(query)
    batteries = []
    for result in result_data.scalars().all():
        result_dict = {
            "brand": result.brand.name,
            "supplier": result.supplier.name,
            "name": result.name,
            "volume": result.volume,
            "full_name": result.full_name,
            "price": result.price,
            "c_amps": result.c_amps,
            "region": result.region,
            "polarity": result.polarity,
            "electrolyte": result.electrolyte,
            "updated_at": result.updated_at
        }
        batteries.append(result_dict)

    await session.close()
    return {"batteries": batteries}


async def ai_analytic(data: AnalyticDataSchema):
    batteries = data.batteries
    comment = data.comment
    result = await analytics_prompt(batteries, comment)
    return {"analytics": result}



async def ai_chart(data: ChartDataSchema):
    session = SessionLocal()
    ban_suppliers = data.ban_suppliers
    ban_ids = []
    for supplier in ban_suppliers:
        query = select(Suppliers).where(Suppliers.name == supplier)
        result = await session.execute(query)
        suplier = result.scalar_one_or_none()
        if suplier:
            ban_ids.append(suplier.id)
    battery = data

    brand_name = battery.brand
    brand_id = await get_or_create_brand(session, brand_name)
    prompt_data = []
    # Використовуємо асинхронний API SQLAlchemy
    query = select(Batteries).where(
        Batteries.brand_id == brand_id,
        Batteries.volume == battery.volume,
        Batteries.c_amps == battery.c_amps,
        Batteries.polarity == battery.polarity,
        Batteries.region == battery.region
    )
    
    if ban_ids:
        query = query.where(Batteries.supplier_id.notin_(ban_ids))
    
    # Додаємо завантаження зв'язаних об'єктів
    query = query.options(
        joinedload(Batteries.brand),
        joinedload(Batteries.supplier)
    )
    
    result = await session.execute(query)
    batteries = result.scalars().all()
    
    for battery in batteries:
        battery_dict = {
            "brand": battery.brand.name if battery.brand else "",
            "supplier": battery.supplier.name if battery.supplier else "",
            "name": battery.name,
            "volume": battery.volume,
            "full_name": battery.full_name,
            "price": battery.price,
            "c_amps": battery.c_amps,
            "region": battery.region,
            "polarity": battery.polarity,
            "electrolyte": battery.electrolyte,
            "created_at": battery.created_at
        }
        prompt_data.append(battery_dict)
    await session.close()

    chart_data = await get_chart_data(input=battery, data=prompt_data)
    chart = plot_combined_price_chart(datasets=chart_data, normalize=True)

    return {"chart": chart}