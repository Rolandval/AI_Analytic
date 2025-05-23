from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import BatteriesSuppliers, SollarPanelsSuppliers
from typing import Optional

async def get_or_create_supplier(session: AsyncSession, suplier_name: str, product: str = "batteries") -> int:
    if product == "batteries":
        suplier_model = BatteriesSuppliers
    elif product == "sollar_panels":
        suplier_model = SollarPanelsSuppliers
    else:
        raise ValueError("Неверный тип продукта")

    if not suplier_name:
        raise ValueError("Название поставщика не может быть пустым")
    
    # Преобразуем название бренда в верхний регистр
    suplier_name_upper = suplier_name.strip().upper()
    
    # Ищем бренд в базе данных
    query = select(suplier_model).where(suplier_model.name == suplier_name_upper)
    result = await session.execute(query)
    suplier = result.scalar_one_or_none()
    
    if suplier:
        return suplier.id
    
    new_suplier = suplier_model(name=suplier_name_upper, is_me=False, is_supplier=True, is_competitor=False)
    session.add(new_suplier)
    await session.flush()  # Получаем ID без коммита
    return new_suplier.id