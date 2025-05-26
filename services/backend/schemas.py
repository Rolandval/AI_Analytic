from pydantic import BaseModel
from typing import List, Optional
import enum
from datetime import datetime

class SortEnumModel(enum.Enum):
    price = "price"
    c_amps = "c_amps"
    volume = "volume"
    region = "region"
    power = "power"

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

class BatteryAnalyticDataSchema(BaseModel):
    batteries: List
    comment: str = ""


class ChartBatteryDataSchema(BaseModel):
    name: str
    full_name: str
    brand: str
    volume: float
    c_amps: int
    polarity: str
    region: str
    # Змінюємо ban_suppliers на include_suppliers для вибору постачальників
    include_suppliers: List[str] = []


class CurrentSollarPanels(BaseModel):
    brand_ids: List[int] = None
    supplier_ids: List[int] = None
    power: List[float] = None
    panel_type: str = "all"
    cell_type: str = "all"
    thickness: List[float] = None
    price_per_w: List[float] = None
    price_diapason: List[int] = None
    page: int = 1
    page_size: int = 10
    sort_by: SortEnumModel = SortEnumModel.price
    sort_order: SortOrderEnumModel = SortOrderEnumModel.desc


class SolarPanelAnalyticDataSchema(BaseModel):
    sollar_panels: List
    comment: str = ""

class ChartSolarPanelDataSchema(BaseModel):
    name: str
    full_name: str
    brand: str
    power: float
    panel_type: str
    cell_type: str
    thickness: float
    # Змінюємо ban_suppliers на include_suppliers для вибору постачальників
    include_suppliers: List[str] = []


class SollarPanelBase(BaseModel):
    brand: str = ""
    supplier: str = ""
    name: str = ""
    power: float = 0.0
    full_name: Optional[str] = None
    price: float = 0.0
    price_per_w: float = 0.0
    thickness: float = 0.0
    panel_type: str = ""
    cell_type: str = ""
    updated_at: Optional[datetime] = None
