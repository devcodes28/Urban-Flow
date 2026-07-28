from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models import User

router = APIRouter(prefix="/api", tags=["Authentication"])

from typing import Optional # Add this import at the top!

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: str
    gender: Optional[str] = None
    transport_type: Optional[str] = None
    employee_id: Optional[str] = None
    license: Optional[str] = None

@router.post("/login")
def login(username: str, password_input: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user or user.password != password_input:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "status": "success",
        "role": user.role,
        "username": user.username,
        "full_name": user.full_name
    }

@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if username already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username is already taken")
    
    # 2. Create the new user
    new_user = User(
        username=user_data.username,
        password=user_data.password, # Note: In a real production app, we would hash this!
        full_name=user_data.full_name,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    
    return {"status": "success", "message": "Registration successful"}