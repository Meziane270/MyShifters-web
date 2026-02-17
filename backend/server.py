from fastapi import FastAPI, APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from enum import Enum
import base64
import json
import secrets
import string
import re
import cloudinary
import cloudinary.uploader

# -----------------------------
# Setup / Env
# -----------------------------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("myshifters")

def get_env(name: str, default: Optional[str] = None, required: bool = False) -> str:
    value = os.environ.get(name, default)
    if required and (value is None or value.strip() == ""):
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value

MONGO_URL = get_env("MONGO_URL", default="mongodb://localhost:27017/myshifters")
DB_NAME = get_env("DB_NAME", default="myshifters")
JWT_SECRET = get_env("JWT_SECRET", default="myshifters-secret-key-2024")
CORS_ORIGINS_RAW = get_env("CORS_ORIGINS", default="*")

# Cloudinary
CLOUDINARY_CLOUD_NAME = get_env("CLOUDINARY_CLOUD_NAME", default="mock")
CLOUDINARY_API_KEY = get_env("CLOUDINARY_API_KEY", default="mock")
CLOUDINARY_API_SECRET = get_env("CLOUDINARY_API_SECRET", default="mock")

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)

# -----------------------------
# App
# -----------------------------
app = FastAPI(title="MyShifters API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

def parse_cors(origins_raw: str) -> List[str]:
    raw = (origins_raw or "").strip()
    if not raw or raw == "*": return ["*"]
    return [o.strip().rstrip("/") for o in raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_cors(CORS_ORIGINS_RAW),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    client = AsyncIOMotorClient(MONGO_URL, tls=True, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    db = None

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

class DateUtils:
    @staticmethod
    def now(): return datetime.now(timezone.utc)
    @staticmethod
    def to_iso(dt: Optional[datetime]) -> Optional[str]:
        if dt is None: return None
        return dt.isoformat() if not isinstance(dt, str) else dt

# -----------------------------
# Enums & Models
# -----------------------------
class UserRole(str, Enum):
    HOTEL = "hotel"
    WORKER = "worker"
    ADMIN = "admin"

class ShiftStatus(str, Enum):
    OPEN = "open"
    FILLED = "filled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ApplicationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"

class UserBase(BaseModel):
    email: EmailStr
    role: UserRole
    hotel_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    verification_status: str = "unverified"
    city: Optional[str] = None
    avatar_url: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ShiftCreate(BaseModel):
    title: str
    description: str
    service_type: str
    dates: List[str]
    start_time: str
    end_time: str
    hourly_rate: float
    positions_available: int = 1

class Shift(ShiftCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hotel_id: str
    hotel_name: str
    hotel_city: Optional[str] = None
    status: ShiftStatus = ShiftStatus.OPEN
    created_at: str = Field(default_factory=lambda: DateUtils.to_iso(DateUtils.now()))

# -----------------------------
# Auth helpers
# -----------------------------
def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload.get("user_id")})
        if not user: raise HTTPException(status_code=401, detail="User not found")
        return user
    except: raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != UserRole.ADMIN: raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# -----------------------------
# Routes
# -----------------------------
@api_router.post("/auth/register")
async def register(userData: Dict[Any, Any]):
    if db is None: raise HTTPException(status_code=500, detail="Database connection failed")
    
    email = userData.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
        
    existing = await db.users.find_one({"email": email})
    if existing: raise HTTPException(status_code=400, detail="Email already registered")
    
    password = userData.get("password")
    if not password: raise HTTPException(status_code=400, detail="Password is required")
    
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    # Flatten userData if needed and remove sensitive fields
    new_user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "password_hash": password_hash,
        "role": userData.get("role", "worker"),
        "first_name": userData.get("first_name"),
        "last_name": userData.get("last_name"),
        "hotel_name": userData.get("hotel_name"),
        "city": userData.get("city"),
        "postal_code": userData.get("postal_code"),
        "phone": userData.get("phone"),
        "verification_status": "unverified",
        "created_at": DateUtils.to_iso(DateUtils.now())
    }
    
    # Add any other fields from userData except already handled ones
    for k, v in userData.items():
        if k not in ["password", "confirmPassword", "email", "role", "first_name", "last_name", "hotel_name", "city", "postal_code", "phone"]:
            new_user[k] = v
            
    await db.users.insert_one(new_user)
    token = create_access_token({"user_id": new_user["id"], "role": new_user["role"]})
    return {"token": token, "user": {k: v for k, v in new_user.items() if k != "password_hash"}}

@api_router.post("/auth/register/worker")
async def register_worker(
    email: str = Form(...),
    password: str = Form(...),
    first_name: str = Form(None),
    last_name: str = Form(None),
    role: str = Form("worker"),
    phone: str = Form(None),
    address: str = Form(None),
    city: str = Form(None),
    postal_code: str = Form(None),
    experience_years: str = Form("0"),
    has_ae_status: str = Form("false"),
    siret: str = Form(None),
    billing_address: str = Form(None),
    billing_city: str = Form(None),
    billing_postal_code: str = Form(None),
    cv_pdf: UploadFile = File(None)
):
    if db is None: raise HTTPException(status_code=500, detail="Database connection failed")
    existing = await db.users.find_one({"email": email})
    if existing: raise HTTPException(status_code=400, detail="Email already registered")
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    cv_url = None
    if cv_pdf:
        try:
            upload_result = cloudinary.uploader.upload(cv_pdf.file)
            cv_url = upload_result.get("secure_url")
        except Exception as e:
            logger.error(f"Failed to upload CV: {e}")
    new_user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "password_hash": password_hash,
        "role": role,
        "first_name": first_name,
        "last_name": last_name,
        "phone": phone,
        "address": address,
        "city": city,
        "postal_code": postal_code,
        "experience_years": int(experience_years) if experience_years else 0,
        "has_ae_status": has_ae_status.lower() == "true",
        "siret": siret,
        "billing_address": billing_address,
        "billing_city": billing_city,
        "billing_postal_code": billing_postal_code,
        "cv_url": cv_url,
        "verification_status": "unverified",
        "created_at": DateUtils.to_iso(DateUtils.now())
    }
    
    # Clean up None values
    new_user = {k: v for k, v in new_user.items() if v is not None}
    
    await db.users.insert_one(new_user)
    token = create_access_token({"user_id": new_user["id"], "role": new_user["role"]})
    return {"token": token, "user": {k: v for k, v in new_user.items() if k != "password_hash"}}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    if db is None: raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        user = await db.users.find_one({"email": credentials.email})
        if not user:
            logger.warning(f"Login failed: User {credentials.email} not found")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        stored_hash = user.get("password_hash")
        if not stored_hash:
            logger.error(f"Login failed: User {credentials.email} has no password_hash")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Check if the stored hash is valid for bcrypt
        is_valid = False
        try:
            # bcrypt.checkpw requires bytes
            if bcrypt.checkpw(credentials.password.encode("utf-8"), stored_hash.encode("utf-8")):
                is_valid = True
        except ValueError as ve:
            # This happens if the salt is invalid (e.g. plain text password in DB)
            logger.warning(f"Bcrypt error for user {credentials.email}: {ve}")
            # Fallback check if you want to allow plain text (not recommended for production but helps during migration)
            if credentials.password == stored_hash:
                is_valid = True
                logger.info(f"User {credentials.email} logged in with plain-text password. Please update to hash.")
        
        if not is_valid:
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
        token = create_access_token({"user_id": user["id"], "role": user["role"]})
        return {"token": token, "user": {k: v for k, v in user.items() if k != "password_hash"}}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "password_hash"}

# Shifts & Applications
@api_router.post("/shifts")
async def create_shift(payload: ShiftCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.HOTEL: raise HTTPException(status_code=403)
    new_shift = Shift(hotel_id=current_user["id"], hotel_name=current_user.get("hotel_name", "Hôtel"), hotel_city=current_user.get("city"), **payload.model_dump())
    await db.shifts.insert_one(new_shift.model_dump())
    return new_shift

@api_router.get("/shifts")
async def get_shifts():
    shifts = await db.shifts.find({"status": ShiftStatus.OPEN}).sort("created_at", -1).to_list(100)
    for s in shifts: s.pop("_id", None)
    return shifts

@api_router.get("/shifts/hotel")
async def get_hotel_shifts(current_user: dict = Depends(get_current_user)):
    shifts = await db.shifts.find({"hotel_id": current_user["id"]}).to_list(100)
    for s in shifts: s.pop("_id", None)
    return shifts

@api_router.post("/applications")
async def apply_to_shift(shift_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.WORKER: raise HTTPException(status_code=403)
    app = {"id": str(uuid.uuid4()), "shift_id": shift_id, "worker_id": current_user["id"], "status": "pending", "created_at": DateUtils.to_iso(DateUtils.now())}
    await db.applications.insert_one(app)
    return app

@api_router.get("/applications/hotel")
async def get_hotel_apps(current_user: dict = Depends(get_current_user)):
    shifts = await db.shifts.find({"hotel_id": current_user["id"]}, {"id": 1}).to_list(100)
    apps = await db.applications.find({"shift_id": {"$in": [s["id"] for s in shifts]}}).to_list(100)
    for a in apps: a.pop("_id", None)
    return apps

# Profile & Avatar
@api_router.post("/worker/avatar")
@api_router.post("/hotel/avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    result = cloudinary.uploader.upload(file.file)
    url = result.get("secure_url")
    await db.users.update_one({"id": current_user["id"]}, {"$set": {"avatar_url": url}})
    return {"avatar_url": url}

# Invoices
@api_router.get("/hotel/invoices")
@api_router.get("/worker/invoices")
async def get_invoices(current_user: dict = Depends(get_current_user)):
    key = "hotel_id" if current_user["role"] == UserRole.HOTEL else "worker_id"
    invs = await db.invoices.find({key: current_user["id"]}).to_list(100)
    for i in invs: i.pop("_id", None)
    return invs

# Support
@api_router.get("/support/threads")
async def get_threads(current_user: dict = Depends(get_current_user)):
    threads = await db.support_threads.find({"user_id": current_user["id"]}).to_list(100)
    for t in threads: t.pop("_id", None)
    return threads

# Admin
@api_router.get("/admin/stats")
async def admin_stats(current_user: dict = Depends(require_admin)):
    return {"total_workers": await db.users.count_documents({"role": "worker"}), "total_hotels": await db.users.count_documents({"role": "hotel"}), "total_shifts": await db.shifts.count_documents({}), "revenue": 0}

@api_router.get("/admin/verifications/pending")
async def pending_verifs(current_user: dict = Depends(require_admin)):
    return {"workers": await db.users.find({"role": "worker", "verification_status": "pending"}, {"_id":0}).to_list(100), "hotels": await db.users.find({"role": "hotel", "verification_status": "pending"}, {"_id":0}).to_list(100)}

@api_router.get("/admin/support/threads")
async def admin_threads(current_user: dict = Depends(require_admin)):
    threads = await db.support_threads.find({}).to_list(100)
    for t in threads: t.pop("_id", None)
    return threads

# Others (Mock)
@api_router.get("/admin/users")
async def admin_users(current_user: dict = Depends(require_admin)): return await db.users.find({}, {"_id":0, "password_hash":0}).to_list(100)
@api_router.get("/admin/reviews")
async def admin_reviews(): return []
@api_router.get("/admin/settings")
async def admin_settings(): return {"maintenance": False}
@api_router.get("/admin/audit")
async def admin_audit(): return []
@api_router.get("/admin/notifications")
async def admin_notifications(): return []
@api_router.get("/admin/revenue")
async def admin_revenue(): return {"total": 0}

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10000)
