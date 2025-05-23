from sqlalchemy import create_engine, text
from sqlalchemy.orm import joinedload
from typing import Callable, List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import Query
from db.database import SessionLocal
from db.models import Batteries, CurrentBatteries, BatteriesBrands, BatteriesSuppliers
from services.backend.schemas import SortEnumModel, SortOrderEnumModel, AnalyticDataSchema, ChartDataSchema
from datetime import datetime
from helpers.brand import get_or_create_brand
from helpers.me import get_my_id
from helpers.competitors import get_competitors_ids
from helpers.prompt import analytics_prompt
from helpers.ai_charts import get_chart_data
from helpers.charts import plot_combined_price_chart
from analytic.price_comparison import price_comparison
from services.backend.schemas import BatteryBase

async def get_brands():
    session = SessionLocal()
    result = await session.execute(select(BatteriesBrands))
    await session.close()
    return result.scalars().all()

async def get_suppliers():
    session = SessionLocal()
    result = await session.execute(select(BatteriesSuppliers))
    await session.close()
    return result.scalars().all()


async def get_current_batteries(
    brand_ids: Optional[List[int]] = None,
    supplier_ids: Optional[List[int]] = None,
    volumes: Optional[List[float]] = None,
    polarities: Optional[List[str]] = None,
    regions: Optional[List[str]] = None,
    electrolytes: Optional[List[str]] = None,
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
    # Детальне логування регіонів
    print(f"Regions: {regions}, type: {type(regions)}")
    if regions is not None and len(regions) > 0:
        print(f"Filtering by regions: {regions}")
        query = query.filter(CurrentBatteries.region.in_(regions))
    
    # Детальне логування електролітів
    print(f"Electrolytes: {electrolytes}, type: {type(electrolytes)}")
    if electrolytes is not None and len(electrolytes) > 0:
        print(f"Filtering by electrolytes: {electrolytes}")
        query = query.filter(CurrentBatteries.electrolyte.in_(electrolytes))
    if len(c_amps) != 0 and c_amps is not None and c_amps != [0]:
        query = query.filter(CurrentBatteries.c_amps.in_(c_amps))
    # Детальне логування цінового діапазону
    print(f"Price diapason: {price_diapason}, type: {type(price_diapason)}")
    if price_diapason is not None and isinstance(price_diapason, list) and len(price_diapason) == 2:
        min_price, max_price = price_diapason
        print(f"Filtering by price between {min_price} and {max_price}")
        query = query.filter(CurrentBatteries.price.between(min_price, max_price))

    count_query = select(func.count()).select_from(CurrentBatteries)
    
    # Застосовуємо ті ж фільтри до запиту підрахунку
    if len(brand_ids) != 0 and brand_ids is not None and brand_ids != [0]:
        count_query = count_query.filter(CurrentBatteries.brand_id.in_(brand_ids))
    if len(supplier_ids) != 0 and supplier_ids is not None and supplier_ids != [0]:
        count_query = count_query.filter(CurrentBatteries.supplier_id.in_(supplier_ids))
    if len(volumes) != 0 and volumes is not None and volumes != [0]:
        count_query = count_query.filter(CurrentBatteries.volume.in_(volumes))
    if len(polarities) != 0 and polarities is not None and polarities != ["string"]:
        count_query = count_query.filter(CurrentBatteries.polarity.in_(polarities))
    # Детальне логування регіонів для запиту підрахунку
    if regions is not None and len(regions) > 0:
        print(f"Filtering count by regions: {regions}")
        count_query = count_query.filter(CurrentBatteries.region.in_(regions))
    
    # Детальне логування електролітів для запиту підрахунку
    if electrolytes is not None and len(electrolytes) > 0:
        print(f"Filtering count by electrolytes: {electrolytes}")
        count_query = count_query.filter(CurrentBatteries.electrolyte.in_(electrolytes))
    if len(c_amps) != 0 and c_amps is not None and c_amps != [0]:
        count_query = count_query.filter(CurrentBatteries.c_amps.in_(c_amps))
    if price_diapason is not None and price_diapason != [0]:
        count_query = count_query.filter(CurrentBatteries.price.between(price_diapason[0], price_diapason[1]))

    # Виконуємо запит для отримання загальної кількості
    total_count_result = await session.execute(count_query)
    total_count = total_count_result.scalar()
    
    # Розраховуємо загальну кількість сторінок
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

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
    return {
        "batteries": batteries,
        "total_pages": total_pages,
        "total_count": total_count,
        "current_page": page
        }


async def ai_analytic(data: AnalyticDataSchema):
    batteries = data.batteries
    comment = data.comment
    result = await analytics_prompt(batteries, comment)
    print(result)
    return {"analytics": result}



async def ai_chart(data: ChartDataSchema):
    session = SessionLocal()
    include_suppliers = data.include_suppliers
    supplier_ids = []
    
    # Якщо вказані постачальники, знаходимо їх ID
    if include_suppliers:
        for supplier_name in include_suppliers:
            query = select(BatteriesSuppliers).where(BatteriesSuppliers.name == supplier_name)
            result = await session.execute(query)
            supplier = result.scalar_one_or_none()
            if supplier:
                supplier_ids.append(supplier.id)
    
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
    
    # Якщо вказані постачальники, фільтруємо за ними
    if supplier_ids:
        query = query.where(Batteries.supplier_id.in_(supplier_ids))
    
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

async def get_price_comparison_data():
    session = SessionLocal()
    try:
        competitor_ids = await get_competitors_ids(session)
        my_id = await get_my_id(session)
        
        
        # Використовуємо joinedload для завантаження зв'язаних об'єктів
        my_data_result = await session.execute(
            select(CurrentBatteries)
            .options(joinedload(CurrentBatteries.brand), joinedload(CurrentBatteries.supplier))
            .where(CurrentBatteries.supplier_id == my_id, CurrentBatteries.price > 0, CurrentBatteries.c_amps > 0, CurrentBatteries.volume > 0, CurrentBatteries.price < 11000)
        )
        my_data = my_data_result.scalars().all()
        my_brands_ids = [battery.brand_id for battery in my_data]
        
        competitors_data_result = await session.execute(
            select(CurrentBatteries)
            .options(joinedload(CurrentBatteries.brand), joinedload(CurrentBatteries.supplier))
            .where(CurrentBatteries.supplier_id.in_(competitor_ids), CurrentBatteries.brand_id.in_(my_brands_ids), CurrentBatteries.price > 0, CurrentBatteries.c_amps > 0, CurrentBatteries.volume > 0, CurrentBatteries.price < 11000)
        )
        competitors_data = competitors_data_result.scalars().all()
        
        # Додаємо await і розділяємо на два кроки
        supplier_result = await session.execute(select(BatteriesSuppliers).where(BatteriesSuppliers.id == my_id))
        supplier = supplier_result.scalar_one_or_none()
        my_company_name = supplier.name if supplier else "Моя компанія"


        my_batteries = [
            BatteryBase(
                brand=battery.brand.name if battery.brand else "",
                supplier=battery.supplier.name if battery.supplier else "",
                name=battery.name,
                volume=battery.volume,
                full_name=battery.full_name,
                price=battery.price,
                c_amps=battery.c_amps,
                region=battery.region,
                polarity=battery.polarity,
                electrolyte=battery.electrolyte,
                updated_at=battery.updated_at
            ) for battery in my_data
        ]
        
        competitors_batteries = [
            BatteryBase(
                brand=battery.brand.name if battery.brand else "",
                supplier=battery.supplier.name if battery.supplier else "",
                name=battery.name,
                full_name=battery.full_name,
                volume=battery.volume,
                price=battery.price,
                c_amps=battery.c_amps,
                region=battery.region,
                polarity=battery.polarity,
                electrolyte=battery.electrolyte,
                supplier_id=battery.supplier_id,
                updated_at=battery.updated_at
            ) for battery in competitors_data
        ]

        # Викликаємо імпортовану функцію price_comparison
        result = price_comparison(my_batteries, competitors_batteries, my_company_name)
        return {"price_comparison": result}
    finally:
        await session.close()