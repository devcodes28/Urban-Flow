from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    password = Column(String(100))
    role = Column(String(20))
    full_name = Column(String(100))
    balance = Column(Float, default=500.0) 

class Pass(Base):
    __tablename__ = "passes"
    id = Column(String(50), primary_key=True)
    destination = Column(String(100))
    status = Column(String(50), default="Ready")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    vehicle_id = Column(String(50), nullable=True) 
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(String(50), primary_key=True)
    type = Column(String(50))
    lat = Column(Float)
    lng = Column(Float)
    occupancy = Column(Integer, default=0)
    status = Column(String(50), default="normal")
    current_station = Column(String(100)) 

class Station(Base):
    __tablename__ = "stations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    amenities = Column(String(255))
    