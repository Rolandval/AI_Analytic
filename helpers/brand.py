from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import Brands
from typing import Optional

async def get_or_create_brand(session: AsyncSession, brand_name: str) -> int:
    """
    Проверяет наличие бренда в базе данных и возвращает его ID.
    Если бренд не найден, создает новый.
    
    Args:
        session: Асинхронная сессия SQLAlchemy
        brand_name: Название бренда
        
    Returns:
        ID бренда
    """
    if not brand_name:
        raise ValueError("Название бренда не может быть пустым")
    
    # Преобразуем название бренда в верхний регистр
    brand_name_upper = brand_name.strip().upper()
    
    # Ищем бренд в базе данных
    query = select(Brands).where(Brands.name == brand_name_upper)
    result = await session.execute(query)
    brand = result.scalar_one_or_none()
    
    # Если бренд найден, возвращаем его ID
    if brand:
        return brand.id
    
    # Если бренд не найден, создаем новый
    new_brand = Brands(name=brand_name_upper)
    session.add(new_brand)
    await session.flush()  # Получаем ID без коммита
    return new_brand.id

async def get_brand_by_name(session: AsyncSession, brand_name: str) -> Optional[Brands]:
    """
    Находит бренд по имени (без создания нового).
    
    Args:
        session: Асинхронная сессия SQLAlchemy
        brand_name: Название бренда
        
    Returns:
        Объект бренда или None, если бренд не найден
    """
    if not brand_name:
        return None
    
    # Преобразуем название бренда в верхний регистр
    brand_name_upper = brand_name.strip().upper()
    
    # Ищем бренд в базе данных
    query = select(Brands).where(Brands.name == brand_name_upper)
    result = await session.execute(query)
    return result.scalar_one_or_none()