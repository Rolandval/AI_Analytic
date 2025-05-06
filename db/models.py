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
    
    brand_id = Column(Integer, ForeignKey('brands.id'), nullable=True)
    supplier_id = Column(Integer, ForeignKey('suppliers.id'), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # ORM-зв'язки
    brand = relationship("Brands", back_populates="batteries")
    supplier = relationship("Suppliers", back_populates="batteries")

class Brands(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    
    # ORM-зв'язки
    batteries = relationship("Batteries", back_populates="brand")
    current_batteries = relationship("CurrentBatteries", back_populates="brand")

class Suppliers(Base):
    __tablename__ = "suppliers"

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



        
    brand_id = Column(Integer, ForeignKey('brands.id'), nullable=True)
    supplier_id = Column(Integer, ForeignKey('suppliers.id'), nullable=True)
    
    updated_at = Column(DateTime, default=datetime.utcnow)

    # ORM-зв'язки
    brand = relationship("Brands", back_populates="current_batteries")
    supplier = relationship("Suppliers", back_populates="current_batteries")
