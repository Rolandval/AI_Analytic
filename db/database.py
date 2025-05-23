from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy import func
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from .models import Base, BatteriesSuppliers, BatteriesBrands

# Завантаження змінних середовища
load_dotenv()

# Отримуємо URL бази даних з змінних середовища або використовуємо значення за замовчуванням
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://db_user:db_password@172.30.16.1:5432/db")

print(f"Using database connection: {DATABASE_URL}")

engine = create_async_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession
)

async def get_session() -> AsyncSession:
    async with SessionLocal() as session:
        yield session

async def create_tables():
    """Создает все таблицы в базе данных"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def init_db():
    """Инициализирует базу данных с начальными данными"""
    
    # Создаем таблицы
    await create_tables()
    
    # Добавляем начальные данные
    async with SessionLocal() as session:
        # Проверяем, есть ли уже поставщики
        supplier_count = await session.execute(func.count(BatteriesSuppliers.id))
        if supplier_count.scalar() == 0:
            # Добавляем поставщика "Авто Аптека"
            supplier = BatteriesSuppliers(
                name="Авто Аптека",
                is_supplier=True
            )
            session.add(supplier)
        
        # Проверяем, есть ли уже бренды
        brand_count = await session.execute(func.count(BatteriesBrands.id))
        if brand_count.scalar() == 0:
            # Добавляем популярные бренды аккумуляторов
            brands = [
                BatteriesBrands(name="BOSCH"),
                BatteriesBrands(name="VARTA"),

            ]
            for brand in brands:
                session.add(brand)
        
        await session.commit()
