from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import BatteriesSuppliers, SollarPanelsSuppliers, InvertersSuppliers
from typing import Optional

async def get_or_create_me(session: AsyncSession, suplier_name: str, product: str = "batteries") -> int:

    if not suplier_name:
        raise ValueError("Название поставщика не может быть пустым")
    if product == "batteries":
        suplier_model = BatteriesSuppliers
    elif product == "sollar_panels":
        suplier_model = SollarPanelsSuppliers
    elif product == "inverters":
        suplier_model = InvertersSuppliers
    else:
        raise ValueError("Неверный тип продукта")
    
    suplier_name_upper = suplier_name.strip().upper()
    
    query = select(suplier_model).where(suplier_model.name == suplier_name_upper)
    result = await session.execute(query)
    suplier = result.scalar_one_or_none()
    
    if suplier:
        return suplier.id
    
    new_suplier = suplier_model(name=suplier_name_upper, is_me=True, is_supplier=False, is_competitor=False)
    session.add(new_suplier)
    await session.flush()  
    return new_suplier.id

async def get_my_id(session: AsyncSession, product: str = "batteries") -> int:
    if product == "batteries":
        suplier_model = BatteriesSuppliers
    elif product == "sollar_panels":
        suplier_model = SollarPanelsSuppliers
    elif product == "inverters":
        suplier_model = InvertersSuppliers
    else:
        raise ValueError("Неверный тип продукта")
    
    query = select(suplier_model).where(suplier_model.is_me == True)
    result = await session.execute(query)
    suplier = result.scalar_one_or_none()
    
    if suplier:
        return suplier.id