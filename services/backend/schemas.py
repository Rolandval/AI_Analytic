from pydantic import BaseModel
from typing import List
import enum

class SortEnumModel(enum.Enum):
    price = "price"
    c_amps = "c_amps"
    volume = "volume"
    region = "region"

class SortOrderEnumModel(enum.Enum):
    asc = "asc"
    desc = "desc"


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
