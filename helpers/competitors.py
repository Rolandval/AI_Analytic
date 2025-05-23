from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import BatteriesSuppliers, SollarPanelsSuppliers
from typing import Optional

async def get_or_create_competitor(session: AsyncSession, suplier_name: str, product: str = "batteries") -> int:

    if not suplier_name:
        raise ValueError("Название поставщика не может быть пустым")
    
    suplier_name_upper = suplier_name.strip().upper()
    
    if product == "batteries":
        suplier_model = BatteriesSuppliers
    elif product == "sollar_panels":
        suplier_model = SollarPanelsSuppliers
    else:
        raise ValueError("Неверный тип продукта")
    
    query = select(suplier_model).where(suplier_model.name == suplier_name_upper)
    result = await session.execute(query)
    suplier = result.scalar_one_or_none()
    
    if suplier:
        return suplier.id
    
    new_suplier = suplier_model(name=suplier_name_upper, is_me=False, is_supplier=False, is_competitor=True)
    session.add(new_suplier)
    await session.flush()  
    return new_suplier.id

async def get_competitors_ids(session: AsyncSession, product: str = "batteries"):
    if product == "batteries":
        suplier_model = BatteriesSuppliers
    elif product == "sollar_panels":
        suplier_model = SollarPanelsSuppliers
    else:
        raise ValueError("Неверный тип продукта")
    
    query = select(suplier_model).where(suplier_model.is_competitor == True)
    result = await session.execute(query)
    return [suplier.id for suplier in result.scalars()]


async def get_competitors_name(func):
    if func.__name__ == "parse_batteries_avto_zvuk":  
        return "Авто Звук"
    if func.__name__ == "parse_batteries_aku_lviv":  
        return "Акумулятори Львів (aku.lviv)"
    if func.__name__ == "parse_batteries_makb":  
        return "MAKB"
    if func.__name__ == "parse_batteries_shyp_shuna":  
        return "Shyp-Shyna"
    if func.__name__ == "parse_batteries_aet_ua":  
        return "AET UA"
    if func.__name__ == "parse_batteries_akb_mag":  
        return "AKB Mag"
    if func.__name__ == "parse_batteries_akb_plus":  
        return "AKB Plus"
    if func.__name__ == "parse_batteries_dvi_klemy":  
        return "DVI Klemy"
    if func.__name__ == "parse_sollar_panels_friends_solar":
        return "Friends Solar"


    