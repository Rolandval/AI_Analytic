from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.orm import sessionmaker, declarative_base


Base = declarative_base()


class Batteries(Base):
    __tablename__ = "batteries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)
    full_name = Column(String, nullable=False)
    c_amps = Column(Integer, nullable=True, default=None)
    region = Column(String, nullable=False, default="EUROPE")
    polarity = Column(String, nullable=False, default="R+")
    electrolyte = Column(String, nullable=False, default="LAB")
    
    brand_id = Column(Integer, ForeignKey('batteries_brands.id'), nullable=True)
    supplier_id = Column(Integer, ForeignKey('batteries_suppliers.id'), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # ORM-зв'язки
    brand = relationship("BatteriesBrands", back_populates="batteries")
    supplier = relationship("BatteriesSuppliers", back_populates="batteries")

class BatteriesBrands(Base):
    __tablename__ = "batteries_brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    
    # ORM-зв'язки
    batteries = relationship("Batteries", back_populates="brand")
    current_batteries = relationship("CurrentBatteries", back_populates="brand")

class BatteriesSuppliers(Base):
    __tablename__ = "batteries_suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    is_me = Column(Boolean, default=False)
    is_supplier = Column(Boolean, default=False)
    is_competitor = Column(Boolean, default=False)
    
    # ORM-зв'язки
    batteries = relationship("Batteries", back_populates="supplier")
    current_batteries = relationship("CurrentBatteries", back_populates="supplier")


class CurrentBatteries(Base):
    __tablename__ = "current_batteries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)
    full_name = Column(String, nullable=False)
    c_amps = Column(Integer, nullable=False, default=0)
    region = Column(String, nullable=False, default="EUROPE")
    polarity = Column(String, nullable=False, default="R+")
    electrolyte = Column(String, nullable=False, default="LAB")



        
    brand_id = Column(Integer, ForeignKey('batteries_brands.id'), nullable=True)
    supplier_id = Column(Integer, ForeignKey('batteries_suppliers.id'), nullable=True)
    
    updated_at = Column(DateTime, default=datetime.utcnow)

    # ORM-зв'язки
    brand = relationship("BatteriesBrands", back_populates="current_batteries")
    supplier = relationship("BatteriesSuppliers", back_populates="current_batteries")


class SollarPanels(Base):
    __tablename__ = "sollar_panels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    price_per_w = Column(Float, nullable=False)
    power = Column(Float, nullable=False)
    full_name = Column(String, nullable=False)
    panel_type = Column(String, nullable=False, default="одностороння")
    cell_type = Column(String, nullable=False, default="n-type")
    thickness = Column(Float, nullable=False, default=30)
    
    brand_id = Column(Integer, ForeignKey('sollar_panels_brands.id'), nullable=True)
    supplier_id = Column(Integer, ForeignKey('sollar_panels_suppliers.id'), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    

    # ORM-зв'язки
    brand = relationship("SollarPanelsBrands", back_populates="sollar_panels")
    supplier = relationship("SollarPanelsSuppliers", back_populates="sollar_panels")


class SollarPanelsCurrent(Base):
    __tablename__ = "sollar_panels_current"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    price_per_w = Column(Float, nullable=False)
    power = Column(Float, nullable=False)
    full_name = Column(String, nullable=False)
    panel_type = Column(String, nullable=False, default="одностороння")
    cell_type = Column(String, nullable=False, default="n-type")
    thickness = Column(Float, nullable=False, default=30)
    
    brand_id = Column(Integer, ForeignKey('sollar_panels_brands.id'), nullable=True)
    supplier_id = Column(Integer, ForeignKey('sollar_panels_suppliers.id'), nullable=True)
    
    updated_at = Column(DateTime, default=datetime.utcnow)

    # ORM-зв'язки
    brand = relationship("SollarPanelsBrands", back_populates="sollar_panels_current")
    supplier = relationship("SollarPanelsSuppliers", back_populates="sollar_panels_current")


class SollarPanelsBrands(Base):
    __tablename__ = "sollar_panels_brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    
    # ORM-зв'язки
    sollar_panels = relationship("SollarPanels", back_populates="brand")
    sollar_panels_current = relationship("SollarPanelsCurrent", back_populates="brand")


class SollarPanelsSuppliers(Base):
    __tablename__ = "sollar_panels_suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    is_me = Column(Boolean, default=False)
    is_supplier = Column(Boolean, default=False)
    is_competitor = Column(Boolean, default=False)
    
    # ORM-зв'язки
    sollar_panels = relationship("SollarPanels", back_populates="supplier")
    sollar_panels_current = relationship("SollarPanelsCurrent", back_populates="supplier")



class Inverters(Base):
    __tablename__ = "inverters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    full_name = Column(String, nullable=False)
    inverter_type = Column(String, nullable=False, default="gybrid")
    generation = Column(String, nullable=False, default="4")
    string_count = Column(Integer, nullable=False, default=0)
    firmware = Column(String, nullable=False, default="")
    power = Column(Float, nullable=False, default=0)
    
    brand_id = Column(Integer, ForeignKey('inverters_brands.id'), nullable=True)
    supplier_id = Column(Integer, ForeignKey('inverters_suppliers.id'), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # ORM-зв'язки
    brand = relationship("InvertersBrands", back_populates="inverters")
    supplier = relationship("InvertersSuppliers", back_populates="inverters")


class CurrentInverters(Base):
    __tablename__ = "current_inverters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    full_name = Column(String, nullable=False)
    inverter_type = Column(String, nullable=False, default="gybrid")
    generation = Column(String, nullable=False, default="4")
    string_count = Column(Integer, nullable=False, default=0)
    firmware = Column(String, nullable=False, default="")
    power = Column(Float, nullable=False, default=0)
    
    brand_id = Column(Integer, ForeignKey('inverters_brands.id'), nullable=True)
    supplier_id = Column(Integer, ForeignKey('inverters_suppliers.id'), nullable=True)
    
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    # ORM-зв'язки
    brand = relationship("InvertersBrands", back_populates="current_inverters")
    supplier = relationship("InvertersSuppliers", back_populates="current_inverters")


class InvertersBrands(Base):
    __tablename__ = "inverters_brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    
    # ORM-зв'язки
    inverters = relationship("Inverters", back_populates="brand")
    current_inverters = relationship("CurrentInverters", back_populates="brand")


class InvertersSuppliers(Base):
    __tablename__ = "inverters_suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    is_me = Column(Boolean, default=False)
    is_supplier = Column(Boolean, default=False)
    is_competitor = Column(Boolean, default=False)
    
    # ORM-зв'язки
    inverters = relationship("Inverters", back_populates="supplier")
    current_inverters = relationship("CurrentInverters", back_populates="supplier")
