from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import asyncio

from db.database import SessionLocal, engine, init_db, get_session

from services.batteries.views import router as batteries_router

app = FastAPI()

@app.on_event("startup")
async def startup_db_client():
    """Инициализирует базу данных при запуске приложения"""
    try:
        await init_db()
        print("База данных инициализирована успешно!")
    except Exception as e:
        print(f"Ошибка при инициализации базы данных: {e}")

# @app.get("/current_products")
# async def read_current_products(session: AsyncSession = Depends(get_session)):
#     result = await session.execute(select(CurrentProducts))
#     products = result.scalars().all()
#     return [{
#         "id": p.id,
#         "name": p.name,
#         "price": p.price,
#         "brand_id": p.brand_id,
#         "supplier_id": p.supplier_id,
#         "updated_at": p.updated_at.isoformat() if p.updated_at else None
#     } for p in products]


app.include_router(batteries_router)