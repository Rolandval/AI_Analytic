from sqlalchemy import create_engine, text
from typing import Callable, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from db.database import SessionLocal
from db.models import SollarPanels, SollarPanelsCurrent, SollarPanelsBrands, SollarPanelsSuppliers
from helpers.brand import get_or_create_brand
from helpers.suplier import get_or_create_supplier
from helpers.competitors import get_or_create_competitor
from services.sollar_panels.parsers.ai_head import parse_ai_reports
from services.sollar_panels.parsers.ai_txt_head import parse_ai_reports as parse_ai_reports_ai_txt
from services.sollar_panels.parsers.competitors_head import parse_ai_reports as parse_ai_reports_competitors

from helpers.me import get_or_create_me
from datetime import datetime


async def process_sollar_panels_import(
    file_path: str | None = None,
    parser_func: Callable[[str], List[Dict[str, Any]]] = parse_ai_reports,
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
            supplier_id = await get_or_create_supplier(session, supplier_name, "sollar_panels")
            
            # Обрабатываем каждую запись
            for entry in data:
                brand_name = entry.get("brand")
                # Ищем бренд
                brand_id = await get_or_create_brand(session, brand_name, "sollar_panels")
                price_per_w=round(entry.get("price") / float(entry.get("power")), 2) if entry.get("power") else None

                
                # Вставляем запись в Batteries
                solar_panel = SollarPanels(
                    name=entry.get("name"),
                    price=entry.get("price"),
                    price_per_w=price_per_w,
                    power=float(entry.get("power")) if entry.get("power") else None,
                    full_name=entry.get("full_name"),
                    brand_id=brand_id,
                    supplier_id=supplier_id,
                    panel_type=entry.get("panel_type"),
                    cell_type=entry.get("cell_type"),
                    thickness=float(entry.get("thickness")) if entry.get("thickness") else None,
                )
                session.add(solar_panel)
                
                # Upsert в CurrentBatteries
                res = await session.execute(select(SollarPanelsCurrent).where(SollarPanelsCurrent.full_name == entry.get("full_name")))
                current = res.scalar_one_or_none()
                if current:
                    current.name = entry.get("name")
                    current.price = entry.get("price")
                    current.price_per_w=price_per_w
                    current.power = float(entry.get("power")) if entry.get("power") else None
                    current.brand_id = brand_id
                    current.supplier_id = supplier_id
                    current.panel_type = entry.get("panel_type")
                    current.cell_type = entry.get("cell_type")
                    current.thickness = float(entry.get("thickness")) if entry.get("thickness") else None
                    current.updated_at = datetime.utcnow()  # Обновляем дату изменения
                else:
                    current = SollarPanelsCurrent(
                        name=entry.get("name"),
                        price=entry.get("price"),
                        price_per_w=price_per_w,
                        power=float(entry.get("power")) if entry.get("power") else None,
                        full_name=entry.get("full_name"),
                        brand_id=brand_id,
                        supplier_id=supplier_id,
                        panel_type=entry.get("panel_type"),
                        cell_type=entry.get("cell_type"),
                        thickness=float(entry.get("thickness")) if entry.get("thickness") else None,
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
            competitor_id = await get_or_create_competitor(session, supplier_name)
            
            # Обрабатываем каждую запись
            for entry in data:
                brand_name = entry.get("brand")
                # Ищем бренд
                brand_id = await get_or_create_brand(session, brand_name)
                price_per_w = round(float(entry.get("price")) / float(entry.get("power")), 2) if entry.get("power") else None
                
                # Вставляем запись в Batteries
                solar_panel = SollarPanels(
                    name=entry.get("name"),
                    price=float(entry.get("price")),
                    full_name=entry.get("full_name"),
                    brand_id=brand_id,
                    supplier_id=competitor_id,
                    power=float(entry.get("power")) if entry.get("power") else None,
                    panel_type=entry.get("panel_type"),
                    cell_type=entry.get("cell_type"),
                    thickness=float(entry.get("thickness")) if entry.get("thickness") else None,
                    price_per_w=price_per_w,
                )
                session.add(solar_panel)
                
                # Upsert в CurrentBatteries
                res = await session.execute(select(SollarPanelsCurrent).where(SollarPanelsCurrent.full_name == entry.get("full_name")))
                current = res.scalar_one_or_none()
                if current:
                    current.name = entry.get("name")
                    current.price = float(entry.get("price"))
                    current.price_per_w=price_per_w
                    current.power = float(entry.get("power")) if entry.get("power") else None
                    current.brand_id = brand_id
                    current.supplier_id = competitor_id
                    current.panel_type = entry.get("panel_type")
                    current.cell_type = entry.get("cell_type")
                    current.thickness = float(entry.get("thickness")) if entry.get("thickness") else None
                    current.updated_at = datetime.utcnow()  # Обновляем дату изменения
                else:
                    current = SollarPanelsCurrent(
                        name=entry.get("name"),
                        price=float(entry.get("price")),
                        price_per_w=price_per_w,
                        power=float(entry.get("power")) if entry.get("power") else None,
                        full_name=entry.get("full_name"),
                        brand_id=brand_id,
                        supplier_id=competitor_id,
                        panel_type=entry.get("panel_type"),
                        cell_type=entry.get("cell_type"),
                        thickness=float(entry.get("thickness")) if entry.get("thickness") else None,
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


async def process_sollar_panels_import_parser(
    async_func,
    supplier_name: str
) -> None:
    """
    Парсит XLSX через parser_func, ищет supplier и brand по имени, затем записывает в таблицу SollarPanels и CurrentSollarPanels (create or update).
    """
    try:
        # Парсим файл до подключения к БД
        data = await parse_ai_reports_competitors(async_func)
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
                price_per_w = round(float(entry.get("price")) / float(entry.get("power")), 2) if entry.get("power") else None
                
                # Вставляем запись в Batteries
                solar_panel = SollarPanels(
                    name=entry.get("name"),
                    price=float(entry.get("price")),
                    price_per_w=price_per_w,
                    full_name=entry.get("full_name"),
                    brand_id=brand_id,
                    supplier_id=competitor_id,
                    power=float(entry.get("power")) if entry.get("power") else None,
                    panel_type=entry.get("panel_type"),
                    cell_type=entry.get("cell_type"),
                    thickness=float(entry.get("thickness")) if entry.get("thickness") else None,
                    polarity=entry.get("polarity"),
                    electrolyte=entry.get("electrolyte"),
                )
                session.add(solar_panel)
                
                # Upsert в CurrentBatteries
                res = await session.execute(select(SollarPanelsCurrent).where(SollarPanelsCurrent.full_name == entry.get("full_name")))
                current = res.scalar_one_or_none()
                if current:
                    current.name = entry.get("name")
                    current.price = float(entry.get("price"))
                    current.price_per_w = price_per_w
                    current.brand_id = brand_id
                    current.supplier_id = competitor_id
                    current.power = float(entry.get("power")) if entry.get("power") else None
                    current.panel_type = entry.get("panel_type")
                    current.cell_type = entry.get("cell_type")
                    current.thickness = float(entry.get("thickness")) if entry.get("thickness") else None
                    current.updated_at = datetime.utcnow()  # Обновляем дату изменения
                else:
                    current = SollarPanelsCurrent(
                        name=entry.get("name"),
                        price=float(entry.get("price")),
                        price_per_w=price_per_w,
                        power=float(entry.get("power")) if entry.get("power") else None,
                        full_name=entry.get("full_name"),
                        brand_id=brand_id,
                        supplier_id=competitor_id,
                        panel_type=entry.get("panel_type"),
                        cell_type=entry.get("cell_type"),
                        thickness=float(entry.get("thickness")) if entry.get("thickness") else None,
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
