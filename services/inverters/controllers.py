from sqlalchemy import create_engine, text
from typing import Callable, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from db.database import SessionLocal
from db.models import Inverters, CurrentInverters, InvertersBrands, InvertersSuppliers
from helpers.brand import get_or_create_brand
from helpers.suplier import get_or_create_supplier
from helpers.competitors import get_or_create_competitor
from services.inverters.parsers.ai_txt_head import parse_ai_reports as parse_ai_reports_ai_txt
from services.inverters.parsers.competitors_head import parse_ai_reports as parse_ai_reports_competitors



from helpers.me import get_or_create_me
from datetime import datetime


async def process_inverters_import(
    file_path: str | None = None,
    parser_func: Callable[[str], List[Dict[str, Any]]] = parse_ai_reports_ai_txt,
    supplier_name: str = "",
    docs_link: str | None = None,
) -> None:
    """
    Парсит XLSX через parser_func, ищет supplier и brand по имени, затем записывает в таблицу SollarPanels и SollarPanelsCurrent (create or update).
    """
    try:
        data = ""
        if file_path:
            data = parser_func(file_path)
        if docs_link:
            data = parser_func(docs_link)
        
        # Парсим файл до подключения к БД
        print(data)
        
        # Создаем новую сессию для каждой операции
        session = SessionLocal()
        try:
            # Ищем поставщика
            supplier_id = await get_or_create_supplier(session, supplier_name, "inverters")
            
            # Обрабатываем каждую запись
            for entry in data:
                brand_name = entry.get("brand")
                # Ищем бренд
                brand_id = await get_or_create_brand(session, brand_name, "inverters")
                

                
                # Вставляем запись в Inverters
                inverter = Inverters(
                    name=entry.get("name"),
                    price=entry.get("price"),
                    full_name=entry.get("full_name"),
                    brand_id=brand_id,
                    supplier_id=supplier_id,
                    inverter_type=entry.get("inverter_type"),
                    generation=entry.get("generation"),
                    string_count=entry.get("string_count"),
                    firmware=entry.get("firmware"),
                    power=entry.get("power"),
                )
                session.add(inverter)
                
                # Upsert в CurrentInverters
                res = await session.execute(select(CurrentInverters).where(CurrentInverters.full_name == entry.get("full_name")))
                current = res.scalar_one_or_none()
                if current:
                    current.name = entry.get("name")
                    current.price = entry.get("price")
                    current.inverter_type=entry.get("inverter_type")
                    current.generation=entry.get("generation")
                    current.string_count=entry.get("string_count")
                    current.firmware=entry.get("firmware")
                    current.brand_id = brand_id
                    current.supplier_id = supplier_id
                    current.power = entry.get("power")
                    current.updated_at = datetime.utcnow()  # Обновляем дату изменения
                else:
                    current = CurrentInverters(
                        name=entry.get("name"),
                        price=entry.get("price"),
                        full_name=entry.get("full_name"),
                        brand_id=brand_id,
                        supplier_id=supplier_id,
                        inverter_type=entry.get("inverter_type"),
                        generation=entry.get("generation"),
                        string_count=entry.get("string_count"),
                        firmware=entry.get("firmware"),
                        power=entry.get("power"),
                        # updated_at заполнится автоматически значением по умолчанию
                    )
                    session.add(current)
                
                # Коммитим изменения после каждых 10 записей
                if len(session.new) >= 10:
                    await session.commit()
            
            # Финальный коммит для оставшихся записей
            await session.commit()
            
        except Exception as e:
            # Откатываем изменения в случае ошибки
            await session.rollback()
            raise e
        finally:
            # Всегда закрываем сессию
            await session.close()
    except Exception as e:
        # Логируем ошибку и пробрасываем дальше
        print(f"Ошибка при импорте: {e}")
        raise e


async def parse_txt(
    text: str,
    supplier_name: str
) -> None:

    try:
        # Парсим файл до подключения к БД
        data = await parse_ai_reports_ai_txt(text)
        
        # Создаем новую се ссию для каждой операции
        session = SessionLocal()
        try:
            # Ищем поставщика
            competitor_id = await get_or_create_competitor(session, supplier_name, "inverters")
            
            # Обрабатываем каждую запись
            for entry in data:
                brand_name = entry.get("brand")
                # Ищем бренд
                brand_id = await get_or_create_brand(session, brand_name, "inverters")
                price_per_w = round(float(entry.get("price")) / float(entry.get("power")), 2) if entry.get("power") else None
                
                # Вставляем запись в Inverters
                inverter = Inverters(
                    name=entry.get("name"),
                    price=entry.get("price"),
                    full_name=entry.get("full_name"),
                    brand_id=brand_id,
                    supplier_id=supplier_id,
                    inverter_type=entry.get("inverter_type"),
                    generation=entry.get("generation"),
                    string_count=entry.get("string_count"),
                    firmware=entry.get("firmware"),
                    power=entry.get("power"),
                )
                session.add(inverter)
                
                # Upsert в CurrentInverters
                res = await session.execute(select(CurrentInverters).where(CurrentInverters.full_name == entry.get("full_name")))
                current = res.scalar_one_or_none()
                if current:
                    current.name = entry.get("name")
                    current.price = entry.get("price")
                    current.brand_id = brand_id
                    current.supplier_id = supplier_id
                    current.inverter_type = entry.get("inverter_type")
                    current.generation = entry.get("generation")
                    current.string_count = entry.get("string_count")
                    current.firmware = entry.get("firmware")
                    current.power = entry.get("power")
                    current.updated_at = datetime.utcnow()  # Обновляем дату изменения
                else:
                    current = CurrentInverters(
                        name=entry.get("name"),
                        price=entry.get("price"),
                        full_name=entry.get("full_name"),
                        brand_id=brand_id,
                        supplier_id=supplier_id,
                        inverter_type=entry.get("inverter_type"),
                        generation=entry.get("generation"),
                        string_count=entry.get("string_count"),
                        firmware=entry.get("firmware"),
                        power=entry.get("power"),
                        # updated_at заполнится автоматически значением по умолчанию
                    )
                    session.add(current)
                    current.thickness = float(entry.get("thickness")) if entry.get("thickness") else None
                    current.updated_at = datetime.utcnow()  # Обновляем дату изменения
                
                # Коммитим изменения после каждых 10 записей
                if len(session.new) >= 10:
                    await session.commit()
            
            # Финальный коммит для оставшихся записей
            await session.commit()
            
            
        except Exception as e:
            # Откатываем изменения в случае ошибки
            await session.rollback()
            raise e
        finally:
            # Всегда закрываем сессию
            await session.close()
    except Exception as e:
        # Логируем ошибку и пробрасываем дальше
        print(f"Ошибка при импорте: {e}")
        raise e


async def process_inverters_import_parser(
    async_func,
    supplier_name: str
) -> None:
    """
    Парсит XLSX через parser_func, ищет supplier и brand по имени, затем записывает в таблицу Inverters и CurrentInverters (create or update).
    """
    try:
        # Парсим файл до подключения к БД
        data = await parse_ai_reports_competitors(async_func)
        print(data)
        
        # Создаем новую сессию для каждой операции
        session = SessionLocal()
        try:
            # Ищем поставщика
            competitor_id = await get_or_create_competitor(session, supplier_name, product="inverters")
            
            # Обрабатываем каждую запись
            for entry in data:
                brand_name = entry.get("brand")
                # Ищем бренд
                brand_id = await get_or_create_brand(session, brand_name, product="inverters")
                price_per_w = round(float(entry.get("price")) / float(entry.get("power")), 2) if entry.get("power") else None
                
                # Вставляем запись в Inverters
                inverter = Inverters(
                    name=entry.get("name"),
                    price=float(entry.get("price")),
                    full_name=entry.get("full_name"),
                    brand_id=brand_id,
                    supplier_id=competitor_id,
                    inverter_type=entry.get("inverter_type"),
                    generation=entry.get("generation"),
                    string_count=entry.get("string_count"),
                    firmware=entry.get("firmware"),
                    power=entry.get("power")
                )
                session.add(inverter)
                
                # Upsert в CurrentInverters
                res = await session.execute(select(CurrentInverters).where(CurrentInverters.full_name == entry.get("full_name")))
                current = res.scalar_one_or_none()
                if current:
                    current.name = entry.get("name")
                    current.price = float(entry.get("price"))
                    current.brand_id = brand_id
                    current.supplier_id = competitor_id
                    current.inverter_type = entry.get("inverter_type")
                    current.generation = entry.get("generation")
                    current.string_count = entry.get("string_count")
                    current.firmware = entry.get("firmware")
                    current.power = entry.get("power")
                    current.updated_at = datetime.utcnow()  # Обновляем дату изменения
                else:
                    current = InvertersCurrent(
                        name=entry.get("name"),
                        price=float(entry.get("price")),
                        full_name=entry.get("full_name"),
                        brand_id=brand_id,
                        supplier_id=competitor_id,
                        inverter_type=entry.get("inverter_type"),
                        generation=entry.get("generation"),
                        string_count=entry.get("string_count"),
                        firmware=entry.get("firmware"),
                        power=entry.get("power"),
                        # updated_at заполнится автоматически значением по умолчанию
                    )
                    session.add(current)
                
                # Коммитим изменения после каждых 10 записей
                if len(session.new) >= 10:
                    await session.commit()
            
            # Финальный коммит для оставшихся записей
            await session.commit()
            
        except Exception as e:
            # Откатываем изменения в случае ошибки
            await session.rollback()
            raise e
        finally:
            # Всегда закрываем сессию
            await session.close()
    except Exception as e:
        # Логируем ошибку и пробрасываем дальше
        print(f"Ошибка при импорте: {e}")
        raise e
