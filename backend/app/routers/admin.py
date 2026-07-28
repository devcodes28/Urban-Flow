from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Vehicle, Station, Pass
from pydantic import BaseModel

router = APIRouter(prefix="/api/admin", tags=["Admin"])

class VehicleCreate(BaseModel):
    id: str
    type: str
    current_station: str

class StationCreate(BaseModel):
    name: str
    amenities: str

@router.get("/fleet")
def get_fleet(db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle).all()
    total_passengers = db.query(Pass).filter(Pass.status == "In-Progress").count()
    return {"vehicles": vehicles, "total_live_passengers": total_passengers}

@router.post("/add-vehicle")
def add_vehicle(v: VehicleCreate, db: Session = Depends(get_db)):
    existing = db.query(Vehicle).filter(Vehicle.id == v.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle ID already exists")
    
    new_v = Vehicle(id=v.id, type=v.type, current_station=v.current_station, lat=8.89, lng=76.61, status='normal')
    db.add(new_v)
    db.commit()
    return {"message": "Vehicle added"}

@router.post("/add-station")
def add_station(s: StationCreate, db: Session = Depends(get_db)):
    new_s = Station(name=s.name, amenities=s.amenities)
    db.add(new_s)
    db.commit()
    return {"message": "Station added"}