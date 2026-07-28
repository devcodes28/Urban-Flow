from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Pass, Vehicle, User

router = APIRouter(prefix="/api/operator", tags=["Operator"])

# 1. Get all vehicles so operator can select their bus/metro
@router.get("/vehicles")
def get_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).all()

# 2. Get live stats for the active vehicle
@router.get("/vehicle/{vehicle_id}")
def get_vehicle_stats(vehicle_id: str, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    return vehicle

# 3. SCANNER: Verify pass, update vehicle occupancy
@router.post("/scan")
def scan_pass(pass_id: str, vehicle_id: str, db: Session = Depends(get_db)):
    db_pass = db.query(Pass).filter(Pass.id == pass_id).first()
    
    if not db_pass:
        raise HTTPException(status_code=404, detail="Invalid Pass ID")
    if db_pass.status == "In-Progress":
        raise HTTPException(status_code=400, detail="Pass already scanned and active")
    if db_pass.status == "Completed":
        raise HTTPException(status_code=400, detail="Pass has already been used")

    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Authorize & Update
    db_pass.status = "In-Progress"
    db_pass.vehicle_id = vehicle_id
    db_vehicle.occupancy += 1
    
    db.commit()
    return {"status": "Authorized", "destination": db_pass.destination}

# 4. Fetch the Live Passenger Manifest
@router.get("/manifest/{vehicle_id}")
def get_manifest(vehicle_id: str, db: Session = Depends(get_db)):
    # Find all passes currently "In-Progress" on this specific vehicle
    active_passes = db.query(Pass).filter(Pass.vehicle_id == vehicle_id, Pass.status == "In-Progress").all()
    
    manifest = []
    for p in active_passes:
        user = db.query(User).filter(User.id == p.user_id).first()
        manifest.append({
            "pass_id": p.id,
            "destination": p.destination,
            "passenger_name": user.full_name if user else "Unknown User",
            "time": p.created_at
        })
    return manifest