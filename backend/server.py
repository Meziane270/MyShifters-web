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
from bson import ObjectId

# -----------------------------
# Setup / Env
# -----------------------------
load_dotenv()

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

# Cloudinary
CLOUDINARY_CLOUD_NAME = "drltfrn45"
CLOUDINARY_API_KEY = "691178755413624"
CLOUDINARY_API_SECRET = "dPbUZ_PcSH0GPH7qaUsfs-2bjaE"

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
    if not origins_raw or origins_raw == "*":
        return ["*"]
    return [o.strip().rstrip("/") for o in origins_raw.split(",") if o.strip()]

CORS_ORIGINS_RAW = os.environ.get("CORS_ORIGINS", "https://myshifters-web.netlify.app")
allowed_origins = parse_cors(CORS_ORIGINS_RAW)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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

def clean_mongo_doc(doc: dict) -> dict:
    if not doc: return doc
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

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
    if not email: raise HTTPException(status_code=400, detail="Email is required")
    existing = await db.users.find_one({"email": email})
    if existing: raise HTTPException(status_code=400, detail="Email already registered")
    password = userData.get("password")
    if not password: raise HTTPException(status_code=400, detail="Password is required")
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    new_user = {
        "id": str(uuid.uuid4()), "email": email, "password_hash": password_hash,
        "role": userData.get("role", "worker"), "first_name": userData.get("first_name"),
        "last_name": userData.get("last_name"), "hotel_name": userData.get("hotel_name"),
        "city": userData.get("city"), "postal_code": userData.get("postal_code"),
        "phone": userData.get("phone"), "verification_status": "pending",
        "created_at": DateUtils.to_iso(DateUtils.now())
    }
    for k, v in userData.items():
        if k not in ["password", "confirmPassword", "email", "role", "first_name", "last_name", "hotel_name", "city", "postal_code", "phone"]:
            new_user[k] = v
    await db.users.insert_one(new_user)
    token = create_access_token({"user_id": new_user["id"], "role": new_user["role"]})
    return {"token": token, "user": clean_mongo_doc({k: v for k, v in new_user.items() if k != "password_hash"})}

@api_router.get("/auth/setup-admin-secure-2026")
async def setup_admin():
    if db is None: raise HTTPException(status_code=500, detail="Database connection failed")
    email = "oulmasmeziane@outlook.com"
    password = "AdminPassword2026!"
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    existing = await db.users.find_one({"email": email})
    if existing:
        await db.users.update_one({"email": email}, {"$set": {"role": "admin", "password_hash": password_hash, "verification_status": "verified"}})
        return {"status": "Admin updated successfully"}

    new_admin = {
        "id": str(uuid.uuid4()), "email": email, "password_hash": password_hash,
        "role": "admin", "first_name": "Meziane", "last_name": "Oulmas",
        "verification_status": "verified", "created_at": DateUtils.to_iso(DateUtils.now())
    }
    await db.users.insert_one(new_admin)
    return {"status": "Admin created successfully"}

@api_router.post("/auth/register/worker")
async def register_worker(
        email: str = Form(...), password: str = Form(...), first_name: str = Form(None),
        last_name: str = Form(None), role: str = Form("worker"), phone: str = Form(None),
        address: str = Form(None), city: str = Form(None), postal_code: str = Form(None),
        experience_years: str = Form("0"), has_ae_status: str = Form("false"), siret: str = Form(None),
        billing_address: str = Form(None), billing_city: str = Form(None), billing_postal_code: str = Form(None),
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
        except Exception as e: logger.error(f"Failed to upload CV: {e}")
    new_user = {
        "id": str(uuid.uuid4()), "email": email, "password_hash": password_hash, "role": role,
        "first_name": first_name, "last_name": last_name, "phone": phone, "address": address,
        "city": city, "postal_code": postal_code, "experience_years": int(experience_years) if experience_years else 0,
        "has_ae_status": has_ae_status.lower() == "true", "siret": siret, "billing_address": billing_address,
        "billing_city": billing_city, "billing_postal_code": billing_postal_code, "cv_url": cv_url,
        "verification_status": "pending", "created_at": DateUtils.to_iso(DateUtils.now())
    }
    new_user = {k: v for k, v in new_user.items() if v is not None}
    await db.users.insert_one(new_user)
    token = create_access_token({"user_id": new_user["id"], "role": new_user["role"]})
    return {"token": token, "user": clean_mongo_doc({k: v for k, v in new_user.items() if k != "password_hash"})}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    if db is None: raise HTTPException(status_code=500, detail="Database connection failed")
    user = await db.users.find_one({"email": credentials.email})
    if not user: raise HTTPException(status_code=401, detail="Invalid email or password")
    stored_hash = user.get("password_hash")
    if not stored_hash: raise HTTPException(status_code=401, detail="Invalid email or password")
    # Vérification robuste avec bcrypt et fallback texte brut
    is_valid = False
    try:
        if bcrypt.checkpw(credentials.password.encode("utf-8"), stored_hash.encode("utf-8")):
            is_valid = True
    except Exception as e:
        logger.warning(f"Bcrypt check failed for {credentials.email}, checking plain text: {e}")
        if credentials.password == stored_hash:
            is_valid = True

    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"user_id": user["id"], "role": user["role"]})
    return {"token": token, "user": clean_mongo_doc({k: v for k, v in user.items() if k != "password_hash"})}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return clean_mongo_doc({k: v for k, v in current_user.items() if k != "password_hash"})

# Shifts
@api_router.post("/shifts")
async def create_shift(payload: ShiftCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.HOTEL: raise HTTPException(status_code=403)
    new_shift = Shift(hotel_id=current_user["id"], hotel_name=current_user.get("hotel_name", "Hôtel"), hotel_city=current_user.get("city"), **payload.model_dump())
    await db.shifts.insert_one(new_shift.model_dump())
    return new_shift

@api_router.get("/shifts")
async def get_shifts():
    shifts = await db.shifts.find({"status": ShiftStatus.OPEN}).sort("created_at", -1).to_list(100)
    return [clean_mongo_doc(s) for s in shifts]

@api_router.get("/shifts/hotel")
async def get_hotel_shifts(current_user: dict = Depends(get_current_user)):
    shifts = await db.shifts.find({"hotel_id": current_user["id"]}).to_list(100)
    return [clean_mongo_doc(s) for s in shifts]

@api_router.delete("/shifts/{shift_id}")
async def delete_shift(shift_id: str, current_user: dict = Depends(get_current_user)):
    await db.shifts.delete_one({"id": shift_id, "hotel_id": current_user["id"]})
    return {"status": "success"}

# Applications
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
    return [clean_mongo_doc(a) for a in apps]

@api_router.put("/applications/{app_id}")
async def update_app(app_id: str, payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    await db.applications.update_one({"id": app_id}, {"$set": payload})
    return {"status": "success"}

# Stats
@api_router.get("/stats/hotel")
async def get_hotel_stats(current_user: dict = Depends(get_current_user)):
    count = await db.shifts.count_documents({"hotel_id": current_user["id"]})
    return {"total_shifts": count}

# Invoices
@api_router.get("/invoices/hotel")
@api_router.get("/invoices/worker")
async def get_invoices(current_user: dict = Depends(get_current_user)):
    key = "hotel_id" if current_user["role"] == UserRole.HOTEL else "worker_id"
    invs = await db.invoices.find({key: current_user["id"]}).to_list(100)
    return [clean_mongo_doc(i) for i in invs]

# Profile & Avatar
@api_router.post("/worker/avatar")
@api_router.post("/hotel/avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    result = cloudinary.uploader.upload(file.file)
    url = result.get("secure_url")
    await db.users.update_one({"id": current_user["id"]}, {"$set": {"avatar_url": url}})
    return {"avatar_url": url}

@api_router.put("/hotels/me")
async def update_hotel_profile(payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.HOTEL: raise HTTPException(status_code=403)
    await db.users.update_one({"id": current_user["id"]}, {"$set": payload})
    return {"status": "success"}

@api_router.get("/hotels/settings")
async def get_hotel_settings(current_user: dict = Depends(get_current_user)):
    settings = await db.hotel_settings.find_one({"hotel_id": current_user["id"]})
    if not settings: return {"vat_number": "", "notifications_email": True, "notifications_sms": False}
    return clean_mongo_doc(settings)

@api_router.put("/hotels/settings")
async def update_hotel_settings(payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    await db.hotel_settings.update_one({"hotel_id": current_user["id"]}, {"$set": payload}, upsert=True)
    return {"status": "success"}

# Support
@api_router.get("/support/threads")
@api_router.get("/support/threads/me")
async def get_threads(current_user: dict = Depends(get_current_user)):
    threads = await db.support_threads.find({"user_id": current_user["id"]}).sort("created_at", -1).to_list(100)
    return [clean_mongo_doc(t) for t in threads]

@api_router.post("/support/threads")
async def create_support_thread(payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    thread = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "user_email": current_user["email"],
        "subject": payload.get("subject"),
        "message": payload.get("message"),
        "status": "open",
        "created_at": DateUtils.to_iso(DateUtils.now())
    }
    await db.support_threads.insert_one(thread)
    return clean_mongo_doc(thread)

# Admin
@api_router.get("/admin/stats")
async def admin_stats(current_user: dict = Depends(require_admin)):
    return {
        "total_workers": await db.users.count_documents({"role": "worker"}),
        "total_hotels": await db.users.count_documents({"role": "hotel"}),
        "pending_workers": await db.users.count_documents({"role": "worker", "verification_status": "pending"}),
        "pending_hotels": await db.users.count_documents({"role": "hotel", "verification_status": "pending"}),
        "total_shifts": await db.shifts.count_documents({}),
        "revenue": 0
    }

@api_router.get("/admin/users")
async def admin_users(current_user: dict = Depends(require_admin)):
    users = await db.users.find({}, {"password_hash": 0}).to_list(100)
    return [clean_mongo_doc(u) for u in users]

@api_router.get("/admin/verifications/pending")
async def pending_verifs(current_user: dict = Depends(require_admin)):
    workers = await db.users.find({"role": "worker", "verification_status": "pending"}).to_list(100)
    hotels = await db.users.find({"role": "hotel", "verification_status": "unverified"}).to_list(100)
    return {"workers": [clean_mongo_doc(w) for w in workers], "hotels": [clean_mongo_doc(h) for h in hotels]}

@api_router.post("/admin/users/{user_id}/verify")
async def verify_user(user_id: str, payload: Dict[Any, Any], current_user: dict = Depends(require_admin)):
    """
    Vérifier ou rejeter un utilisateur en attente.

    Payload:
    {
        "status": "verified" | "rejected",
        "reason": "Motif du rejet (optionnel, requis si status=rejected)"
    }
    """
    status = payload.get("status")
    reason = payload.get("reason", "")

    if status not in ["verified", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'verified' or 'rejected'")

    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Mettre à jour le statut
    update_data = {"verification_status": status}
    if status == "rejected" and reason:
        update_data["rejection_reason"] = reason

    await db.users.update_one({"id": user_id}, {"$set": update_data})

    # TODO: Envoyer un email à l'utilisateur
    # if status == "verified":
    #     send_verification_approved_email(user["email"], user.get("hotel_name") or user.get("first_name"))
    # else:
    #     send_verification_rejected_email(user["email"], reason)

    return {"status": "success", "message": f"User {status}"}

@api_router.get("/admin/support/threads")
async def admin_threads(current_user: dict = Depends(require_admin)):
    threads = await db.support_threads.find({}).to_list(100)
    return [clean_mongo_doc(t) for t in threads]

# Mock/Missing Routes for 404
@api_router.get("/admin/audit")
async def admin_audit(): return []
@api_router.get("/admin/disputes")
async def admin_disputes(current_user: dict = Depends(require_admin)):
    disputes = await db.disputes.find({}).to_list(100)
    return [clean_mongo_doc(d) for d in disputes]

@api_router.post("/admin/disputes")
async def create_dispute(payload: Dict[Any, Any], current_user: dict = Depends(require_admin)):
    payload["id"] = str(uuid.uuid4())
    payload["created_at"] = DateUtils.to_iso(DateUtils.now())
    await db.disputes.insert_one(payload)
    return payload
@api_router.get("/admin/notifications")
async def admin_notifications(): return []
@api_router.get("/admin/reviews")
async def admin_reviews(): return []
@api_router.get("/admin/settings")
async def admin_settings():
    settings = await db.settings.find_one({"type": "general"})
    if not settings:
        return {"maintenance": False, "registration_enabled": True}
    return clean_mongo_doc(settings)

@api_router.put("/admin/settings")
async def update_admin_settings(payload: Dict[Any, Any], current_user: dict = Depends(require_admin)):
    await db.settings.update_one({"type": "general"}, {"$set": payload}, upsert=True)
    return {"status": "success"}
@api_router.get("/admin/revenue")
async def admin_revenue(): return {"total": 0}

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10000)
