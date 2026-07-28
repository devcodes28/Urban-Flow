from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Pass, Station, User, Vehicle
from pydantic import BaseModel
import random

router = APIRouter(prefix="/api/commuter", tags=["Commuter"])

class TicketRequest(BaseModel):
    username: str
    destination: str
    cost: float 

@router.get("/stations")
def get_stations(db: Session = Depends(get_db)):
    return db.query(Station).all()

@router.get("/balance/{username}")
def get_balance(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"balance": user.balance}

@router.get("/vehicles/{v_type}/{station}")
def get_available_vehicles(v_type: str, station: str, db: Session = Depends(get_db)):
    # Filter by type, remove critical vehicles, and match the starting station
    vehicles = db.query(Vehicle).filter(
        Vehicle.type == v_type.lower(),
        Vehicle.status != 'critical',
        Vehicle.current_station == station
    ).all()
    return vehicles

@router.post("/book-pass")
def book_pass(req: TicketRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Wallet Logic
    if user.balance < req.cost:
        raise HTTPException(status_code=400, detail="Insufficient funds in digital wallet")
        
    user.balance -= req.cost

    pass_id = f"UF-{random.randint(100, 999)}-{random.choice(['AZ', 'BX', 'CQ'])}"
    new_pass = Pass(id=pass_id, destination=req.destination, user_id=user.id, status="Ready")
    
    db.add(new_pass)
    db.commit()
    
    return {"status": "success", "pass_id": pass_id, "new_balance": user.balance}

@router.get("/history/{username}")
def get_history(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return []
    
    history = db.query(Pass).filter(Pass.user_id == user.id).order_by(Pass.created_at.desc()).limit(5).all()
    return history