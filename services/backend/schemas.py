from pydantic import BaseModel
from typing import List, Optional
import enum
from datetime import datetime

class SortEnumModel(enum.Enum):
    price = "price"
    c_amps = "c_amps"
    volume = "volume"
    region = "region"

class SortOrderEnumModel(enum.Enum):
    asc = "asc"
    desc = "desc"


class BatteryBase(BaseModel):
    brand: str = ""
    supplier: str = ""
    name: str = ""
    volume: Optional[float] = None
    full_name: Optional[str] = None
    price: float = 0.0
    c_amps: Optional[int] = None
    region: Optional[str] = None
    polarity: Optional[str] = None
    electrolyte: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Для сумісності з SQLAlchemy моделями


class CurrentBattery(BaseModel):
    brand_ids: List[int] = None
    supplier_ids: List[int] = None
    volumes: List[float] = None
    polarities: List[str] = None
    regions: List[str] = None
    electrolytes: List[str] = None
    c_amps: List[int] = None
    price_diapason: List[int] = None
    page: int = 1
    page_size: int = 10
    sort_by: SortEnumModel = SortEnumModel.price
    sort_order: SortOrderEnumModel = SortOrderEnumModel.desc

class AnalyticDataSchema(BaseModel):
    batteries: List
    comment: str = ""


class ChartDataSchema(BaseModel):
    name: str
    full_name: str
    brand: str
    volume: float
    c_amps: int
    polarity: str
    region: str
    # Змінюємо ban_suppliers на include_suppliers для вибору постачальників
    include_suppliers: List[str] = []
