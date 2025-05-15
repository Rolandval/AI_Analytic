from sqlalchemy import create_engine, text
from typing import Callable, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from db.database import SessionLocal
from db.models import Batteries, CurrentBatteries, Brands, Suppliers
from helpers.brand import get_or_create_brand
from helpers.suplier import get_or_create_supplier
from helpers.competitors import get_or_create_competitor
from parsers.competitors_head import parse_ai_reports
from helpers.me import get_or_create_me
from datetime import datetime

# Функція для отримання всіх записів з таблиці Good бази TorgSoftDB
def get_all_goods():
    # Параметры подключения через pymssql сразу к TorgSoftDB
    conn_str = "mssql+pymssql://sa:1qaz!QAZ@172.20.10.110:1433/TorgSoftDB"
    engine = create_engine(conn_str)
    with engine.connect() as conn:
        # Виконуємо запит до таблиці Good
        result = conn.execute(text("SELECT * FROM Good"))
        columns = result.keys()
        rows = result.fetchall()

    # Повертаємо дані у вигляді списку словників
    return [dict(zip(columns, row)) for row in rows]

async def process_batteries_import(
    file_path: str,
    parser_func: Callable[[str], List[Dict[str, Any]]],
    supplier_name: str
) -> None:
    """
    Парсит XLSX через parser_func, ищет supplier и brand по имени, затем записывает в таблицу Batteries и CurrentBatteries (create or update).
    """
    try:
        # Парсим файл до подключения к БД
        data = parser_func(file_path)
        print(data)
        
        # Создаем новую сессию для каждой операции
        session = SessionLocal()
        try:
            # Ищем поставщика
            supplier_id = await get_or_create_supplier(session, supplier_name)
            
            # Обрабатываем каждую запись
            for entry in data:
                brand_name = entry.get("brand")
                # Ищем бренд
                brand_id = await get_or_create_brand(session, brand_name)
                
                # Вставляем запись в Batteries
                battery = Batteries(
                    name=entry.get("name"),
                    price=entry.get("price"),
                    volume=float(entry.get("volume")) if entry.get("volume") else None,
                    full_name=entry.get("full_name"),
                    brand_id=brand_id,
                    supplier_id=supplier_id,
                    c_amps=entry.get("c_amps"),
                    region=entry.get("region"),
                    polarity=entry.get("polarity"),
                    electrolyte=entry.get("electrolyte"),
                )
                session.add(battery)
                
                # Upsert в CurrentBatteries
                res = await session.execute(select(CurrentBatteries).where(CurrentBatteries.full_name == entry.get("full_name")))
                current = res.scalar_one_or_none()
                if current:
                    current.name = entry.get("name")
                    current.price = entry.get("price")
                    current.volume = float(entry.get("volume")) if entry.get("volume") else None
                    current.brand_id = brand_id
                    current.supplier_id = supplier_id
                    current.c_amps = entry.get("c_amps")
                    current.region = entry.get("region")
                    current.polarity = entry.get("polarity")
                    current.electrolyte = entry.get("electrolyte")
                    current.updated_at = datetime.utcnow()  # Обновляем дату изменения
                else:
                    current = CurrentBatteries(
                        name=entry.get("name"),
                        price=entry.get("price"),
                        volume=float(entry.get("volume")) if entry.get("volume") else None,
                        full_name=entry.get("full_name"),
                        brand_id=brand_id,
                        supplier_id=supplier_id,
                        c_amps=entry.get("c_amps"),
                        region=entry.get("region"),
                        polarity=entry.get("polarity"),
                        electrolyte=entry.get("electrolyte"),
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



async def process_batteries_import_parser(
    async_func,
    supplier_name: str
) -> None:
    """
    Парсит XLSX через parser_func, ищет supplier и brand по имени, затем записывает в таблицу Batteries и CurrentBatteries (create or update).
    """
    try:
        # Парсим файл до подключения к БД
        data = await parse_ai_reports(async_func)
        print(data)
        
        # Создаем новую сессию для каждой операции
        session = SessionLocal()
        try:
            # Ищем поставщика
            competitor_id = await get_or_create_competitor(session, supplier_name)
            
            # Обрабатываем каждую запись
            for entry in data:
                brand_name = entry.get("brand")
                # Ищем бренд
                brand_id = await get_or_create_brand(session, brand_name)
                
                # Вставляем запись в Batteries
                battery = Batteries(
                    name=entry.get("name"),
                    price=float(entry.get("price")),
                    volume=float(entry.get("volume")) if entry.get("volume") else None,
                    full_name=entry.get("full_name"),
                    brand_id=brand_id,
                    supplier_id=competitor_id,
                    c_amps=entry.get("c_amps"),
                    region=entry.get("region"),
                    polarity=entry.get("polarity"),
                    electrolyte=entry.get("electrolyte"),
                )
                session.add(battery)
                
                # Upsert в CurrentBatteries
                res = await session.execute(select(CurrentBatteries).where(CurrentBatteries.full_name == entry.get("full_name")))
                current = res.scalar_one_or_none()
                if current:
                    current.name = entry.get("name")
                    current.price = float(entry.get("price"))
                    current.volume = float(entry.get("volume")) if entry.get("volume") else None
                    current.brand_id = brand_id
                    current.supplier_id = competitor_id
                    current.c_amps = entry.get("c_amps")
                    current.region = entry.get("region")
                    current.polarity = entry.get("polarity")
                    current.electrolyte = entry.get("electrolyte")
                    current.updated_at = datetime.utcnow()  # Обновляем дату изменения
                else:
                    current = CurrentBatteries(
                        name=entry.get("name"),
                        price=float(entry.get("price")),
                        volume=float(entry.get("volume")) if entry.get("volume") else None,
                        full_name=entry.get("full_name"),
                        brand_id=brand_id,
                        supplier_id=competitor_id,
                        c_amps=entry.get("c_amps"),
                        region=entry.get("region"),
                        polarity=entry.get("polarity"),
                        electrolyte=entry.get("electrolyte"),
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


async def me_parser(
    async_func,
    supplier_name: str
) -> None:
    """
    Парсит XLSX через parser_func, ищет supplier и brand по имени, затем записывает в таблицу Batteries и CurrentBatteries (create or update).
    """
    try:
        # Парсим файл до подключения к БД
        data = await parse_ai_reports(async_func)
        print(data)
        
        # Создаем новую сессию для каждой операции
        session = SessionLocal()
        try:
            # Ищем поставщика
            me_id = await get_or_create_me(session, supplier_name)
            
            # Обрабатываем каждую запись
            for entry in data:
                brand_name = entry.get("brand")
                # Ищем бренд
                brand_id = await get_or_create_brand(session, brand_name)
                
                # Вставляем запись в Batteries
                battery = Batteries(
                    name=entry.get("name"),
                    price=float(entry.get("price")),
                    volume=float(entry.get("volume")) if entry.get("volume") else None,
                    full_name=entry.get("full_name"),
                    brand_id=brand_id,
                    supplier_id=me_id,
                    c_amps=entry.get("c_amps"),
                    region=entry.get("region"),
                    polarity=entry.get("polarity"),
                    electrolyte=entry.get("electrolyte"),
                )
                session.add(battery)
                
                # Upsert в CurrentBatteries
                res = await session.execute(select(CurrentBatteries).where(CurrentBatteries.full_name == entry.get("full_name")))
                current = res.scalar_one_or_none()
                if current:
                    current.name = entry.get("name")
                    current.price = float(entry.get("price"))
                    current.volume = float(entry.get("volume")) if entry.get("volume") else None
                    current.brand_id = brand_id
                    current.supplier_id = me_id
                    current.c_amps = entry.get("c_amps")
                    current.region = entry.get("region")
                    current.polarity = entry.get("polarity")
                    current.electrolyte = entry.get("electrolyte")
                    current.updated_at = datetime.utcnow()  # Обновляем дату изменения
                else:
                    current = CurrentBatteries(
                        name=entry.get("name"),
                        price=float(entry.get("price")),
                        volume=float(entry.get("volume")) if entry.get("volume") else None,
                        full_name=entry.get("full_name"),
                        brand_id=brand_id,
                        supplier_id=me_id,
                        c_amps=entry.get("c_amps"),
                        region=entry.get("region"),
                        polarity=entry.get("polarity"),
                        electrolyte=entry.get("electrolyte"),
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