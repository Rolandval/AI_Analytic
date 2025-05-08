from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import Suppliers
from typing import Optional

async def get_or_create_competitor(session: AsyncSession, suplier_name: str) -> int:

    if not suplier_name:
        raise ValueError("Название поставщика не может быть пустым")
    
    suplier_name_upper = suplier_name.strip().upper()
    
    query = select(Suppliers).where(Suppliers.name == suplier_name_upper)
    result = await session.execute(query)
    suplier = result.scalar_one_or_none()
    
    if suplier:
        return suplier.id
    
    new_suplier = Suppliers(name=suplier_name_upper, is_me=False, is_supplier=False, is_competitor=True)
    session.add(new_suplier)
    await session.flush()  
    return new_suplier.id


async def get_competitors_name(func):
    if func.__name__ == "parse_batteries_avto_zvuk":  
        return "Авто Звук"
    if func.__name__ == "parse_batteries_aku_lviv":  
        return "Акумулятори Львів (aku.lviv)"
    if func.__name__ == "parse_batteries_makb":  
        return "MAKB"