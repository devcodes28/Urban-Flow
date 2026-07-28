from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base

# Import the routers
from .routers import auth, commuter, operator, admin

# Create tables in MySQL if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="UrbanFlow Core Engine")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow React to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the routes
app.include_router(auth.router)
app.include_router(commuter.router)
app.include_router(operator.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"status": "UrbanFlow Backend is Active"}