from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import BatteriesBrands, SollarPanelsBrands, InvertersBrands
from typing import Optional

async def get_or_create_brand(session: AsyncSession, brand_name: str, product: str = "batteries") -> int:
    if product == "batteries":
        brand_model = BatteriesBrands
    elif product == "sollar_panels":
        brand_model = SollarPanelsBrands
    elif product == "inverters":
        brand_model = InvertersBrands
    else:
        raise ValueError("Неверный тип продукта")
    
    if not brand_name:
        raise ValueError("Название бренда не может быть пустым")
    
    # Преобразуем название бренда в верхний регистр
    brand_name_upper = brand_name.strip().upper()
    
    # Ищем бренд в базе данных
    query = select(brand_model).where(brand_model.name == brand_name_upper)
    result = await session.execute(query)
    brand = result.scalar_one_or_none()
    
    # Если бренд найден, возвращаем его ID
    if brand:
        return brand.id
    
    # Если бренд не найден, создаем новый
    new_brand = brand_model(name=brand_name_upper)
    session.add(new_brand)
    await session.flush()  # Получаем ID без коммита
    return new_brand.id

async def get_brand_by_name(session: AsyncSession, brand_name: str, product: str = "batteries") -> Optional[BatteriesBrands]:
    """
    Находит бренд по имени (без создания нового).
    
    Args:
        session: Асинхронная сессия SQLAlchemy
        brand_name: Название бренда
        
    Returns:
        Объект бренда или None, если бренд не найден
    """
    if product == "batteries":
        brand_model = BatteriesBrands
    elif product == "sollar_panels":
        brand_model = SollarPanelsBrands
    elif product == "inverters":
        brand_model = InvertersBrands
    else:
        raise ValueError("Неверный тип продукта")
    
    if not brand_name:
        return None
    
    # Преобразуем название бренда в верхний регистр
    brand_name_upper = brand_name.strip().upper()
    
    # Ищем бренд в базе данных
    query = select(brand_model).where(brand_model.name == brand_name_upper)
    result = await session.execute(query)
    return result.scalar_one_or_none()