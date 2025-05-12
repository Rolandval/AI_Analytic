from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import asyncio
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from db.database import SessionLocal, engine, init_db, get_session

# Завантаження змінних середовища з .env файлу
load_dotenv()

from services.batteries.views import router as batteries_router
from services.backend.views import router as backend_router

app = FastAPI()

# Додаємо CORS middleware
# Отримуємо дозволені джерела з змінних середовища або використовуємо значення за замовчуванням
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # Дозволяємо запити з вказаних джерел
    allow_credentials=True,
    allow_methods=["*"],  # Дозволяємо всі методи
    allow_headers=["*"],  # Дозволяємо всі заголовки
)

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


# Додаємо ендпоінт для перевірки здоров'я
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

app.include_router(batteries_router)
app.include_router(backend_router)