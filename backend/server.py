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
    if not doc:
        return doc
    doc = doc.copy()
    if "_id" in doc:
        if "id" not in doc:
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
    hotel_hourly_rate: Optional[float] = None # Taux incluant la commission de 15%

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

@api_router.post("/auth/register/worker")
async def register_worker(
        email: str = Form(...), password: str = Form(...), first_name: str = Form(None),
        last_name: str = Form(None), role: str = Form("worker"), phone: str = Form(None),
        address: str = Form(None), city: str = Form(None), postal_code: str = Form(None),
        experience_years: str = Form("0"), has_ae_status: str = Form("false"), siret: str = Form(None),
        billing_address: str = Form(None), billing_city: str = Form(None), billing_postal_code: str = Form(None),
        skills: str = Form("[]"),
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
    
    try:
        skills_list = json.loads(skills)
    except:
        skills_list = []

    new_user = {
        "id": str(uuid.uuid4()), "email": email, "password_hash": password_hash, "role": role,
        "first_name": first_name, "last_name": last_name, "phone": phone, "address": address,
        "city": city, "postal_code": postal_code, "experience_years": int(experience_years) if experience_years else 0,
        "has_ae_status": has_ae_status.lower() == "true", "siret": siret, "billing_address": billing_address,
        "billing_city": billing_city, "billing_postal_code": billing_postal_code, "cv_url": cv_url,
        "skills": skills_list,
        "verification_status": "pending", "created_at": DateUtils.to_iso(DateUtils.now())
    }
    
    # Enregistrer le CV comme document initial si présent
    if cv_url:
        cv_doc = {
            "id": str(uuid.uuid4()),
            "user_id": new_user["id"],
            "type": "cv",
            "url": cv_url,
            "status": "pending",
            "created_at": DateUtils.to_iso(DateUtils.now())
        }
        await db.documents.insert_one(cv_doc)

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

# Worker Profile Routes
@api_router.get("/worker/profile")
async def get_worker_profile(current_user: dict = Depends(get_current_user)):
    return clean_mongo_doc({k: v for k, v in current_user.items() if k != "password_hash"})

@api_router.put("/worker/profile")
async def update_worker_profile(payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.WORKER: raise HTTPException(status_code=403)
    # Ne pas autoriser la modification de l'email ou du role ici
    update_data = {k: v for k, v in payload.items() if k not in ["id", "email", "role", "password_hash"]}
    await db.users.update_one({"id": current_user["id"]}, {"$set": update_data})
    return {"status": "success"}

@api_router.get("/worker/experiences")
async def get_worker_experiences(current_user: dict = Depends(get_current_user)):
    exps = await db.experiences.find({"user_id": current_user["id"]}).to_list(100)
    return [clean_mongo_doc(e) for e in exps]

@api_router.post("/worker/experiences")
async def add_worker_experience(payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    payload["id"] = str(uuid.uuid4())
    payload["user_id"] = current_user["id"]
    payload["created_at"] = DateUtils.to_iso(DateUtils.now())
    await db.experiences.insert_one(payload)
    return clean_mongo_doc(payload)

@api_router.delete("/worker/experiences/{exp_id}")
async def delete_worker_experience(exp_id: str, current_user: dict = Depends(get_current_user)):
    await db.experiences.delete_one({"id": exp_id, "user_id": current_user["id"]})
    return {"status": "success"}

@api_router.get("/worker/documents")
async def get_worker_documents(current_user: dict = Depends(get_current_user)):
    docs = await db.documents.find({"user_id": current_user["id"]}).to_list(100)
    return [clean_mongo_doc(d) for d in docs]

@api_router.post("/worker/documents")
async def upload_worker_document(file: UploadFile = File(...), type: str = Form(...), current_user: dict = Depends(get_current_user)):
    try:
        upload_result = cloudinary.uploader.upload(file.file)
        url = upload_result.get("secure_url")
        doc = {
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            "type": type,
            "url": url,
            "status": "pending",
            "mime_type": file.content_type,
            "created_at": DateUtils.to_iso(DateUtils.now())
        }
        await db.documents.insert_one(doc)
        return clean_mongo_doc(doc)
    except Exception as e:
        logger.error(f"Failed to upload document: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload document")

@api_router.delete("/worker/documents/{doc_id}")
async def delete_worker_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    await db.documents.delete_one({"id": doc_id, "user_id": current_user["id"]})
    return {"status": "success"}

@api_router.get("/worker/payout-account")
async def get_payout_account(current_user: dict = Depends(get_current_user)):
    account = await db.payout_accounts.find_one({"user_id": current_user["id"]})
    if not account: return {"iban": "", "bic": "", "status": "pending"}
    return clean_mongo_doc(account)

@api_router.post("/worker/payout-account")
async def update_payout_account(payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    await db.payout_accounts.update_one(
        {"user_id": current_user["id"]},
        {"$set": {**payload, "user_id": current_user["id"], "updated_at": DateUtils.to_iso(DateUtils.now())}},
        upsert=True
    )
    return {"status": "success"}

@api_router.get("/worker/business")
async def get_worker_business(current_user: dict = Depends(get_current_user)):
    # Récupérer les infos AE depuis l'utilisateur directement ou une collection dédiée
    return {
        "has_ae_status": current_user.get("has_ae_status", False),
        "siret": current_user.get("siret", ""),
        "billing_address": current_user.get("billing_address", ""),
        "billing_city": current_user.get("billing_city", ""),
        "billing_postal_code": current_user.get("billing_postal_code", "")
    }

@api_router.put("/worker/ae-billing")
async def update_worker_business(payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    await db.users.update_one({"id": current_user["id"]}, {"$set": payload})
    return {"status": "success"}

# Shifts
@api_router.post("/shifts")
async def create_shift(payload: ShiftCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.HOTEL: raise HTTPException(status_code=403)
    
    # Calcul de la commission de 15% pour l'hôtel
    data = payload.model_dump()
    data["hotel_hourly_rate"] = round(payload.hourly_rate * 1.15, 2)
    
    new_shift = Shift(
        hotel_id=current_user["id"], 
        hotel_name=current_user.get("hotel_name", "Hôtel"), 
        hotel_city=current_user.get("city"), 
        **data
    )
    await db.shifts.insert_one(new_shift.model_dump())
    return new_shift

@api_router.get("/shifts")
async def get_shifts(service_type: Optional[str] = None):
    query = {"status": ShiftStatus.OPEN}
    if service_type:
        query["service_type"] = service_type
    shifts = await db.shifts.find(query).sort("created_at", -1).to_list(100)
    return [clean_mongo_doc(s) for s in shifts]

@api_router.get("/shifts/hotel")
async def get_hotel_shifts(
    current_user: dict = Depends(get_current_user),
    status: Optional[str] = Query(None)
):
    query = {"hotel_id": current_user["id"]}
    if status:
        query["status"] = status
    shifts = await db.shifts.find(query).sort("created_at", -1).to_list(100)
    result = []
    for shift in shifts:
        shift = clean_mongo_doc(shift)
        # Récupérer le worker assigné si mission completée
        if shift.get("status") in ["completed", "filled"]:
            accepted_app = await db.applications.find_one({"shift_id": shift["id"], "status": {"$in": ["accepted", "completed"]}})
            if accepted_app:
                worker = await db.users.find_one({"id": accepted_app.get("worker_id")}, {"password_hash": 0})
                if worker:
                    shift["worker_id"] = worker.get("id")
                    shift["worker_name"] = f"{worker.get('first_name','')} {worker.get('last_name','')}".strip()
                    shift["worker_email"] = worker.get("email")
        result.append(shift)
    return result

@api_router.delete("/shifts/{shift_id}")
async def delete_shift(shift_id: str, current_user: dict = Depends(get_current_user)):
    await db.shifts.delete_one({"id": shift_id, "hotel_id": current_user["id"]})
    return {"status": "success"}

# Applications
@api_router.post("/applications")
async def apply_to_shift(payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.WORKER: raise HTTPException(status_code=403)
    shift_id = payload.get("shift_id")
    if not shift_id: raise HTTPException(status_code=400, detail="shift_id is required")
    
    # Vérifier si déjà postulé
    existing = await db.applications.find_one({"shift_id": shift_id, "worker_id": current_user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà postulé à cette mission")
    
    app = {
        "id": str(uuid.uuid4()),
        "shift_id": shift_id,
        "worker_id": current_user["id"],
        "message": payload.get("message", ""),
        "status": ApplicationStatus.PENDING,
        "created_at": DateUtils.to_iso(DateUtils.now())
    }
    await db.applications.insert_one(app)
    return clean_mongo_doc(app)

@api_router.get("/applications/worker")
async def get_worker_applications(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.WORKER:
        raise HTTPException(status_code=403, detail="Accès réservé aux workers")
    applications = await db.applications.find({"worker_id": current_user["id"]}).to_list(100)
    # Enrichir avec les détails du shift
    result = []
    for app in applications:
        app = clean_mongo_doc(app)
        shift = await db.shifts.find_one({"id": app["shift_id"]})
        if (shift):
            shift = clean_mongo_doc(shift)
            app["shift_title"] = shift.get("title")
            app["hotel_name"] = shift.get("hotel_name")
            app["shift_date"] = shift.get("dates", [""])[0] if shift.get("dates") else ""
            app["shift_start_time"] = shift.get("start_time")
            app["hourly_rate"] = shift.get("hourly_rate")
            app["shift_details"] = shift # Détails complets pour la modal
        result.append(app)
    return result

@api_router.get("/applications/hotel")
async def get_hotel_apps(current_user: dict = Depends(get_current_user)):
    shifts = await db.shifts.find({"hotel_id": current_user["id"]}, {"id": 1}).to_list(100)
    shift_ids = [s["id"] for s in shifts]
    apps = await db.applications.find({"shift_id": {"$in": shift_ids}}).to_list(100)
    # Enrichir avec les infos du worker
    result = []
    for app in apps:
        app = clean_mongo_doc(app)
        worker = await db.users.find_one({"id": app["worker_id"]})
        if worker:
            app["worker_first_name"] = worker.get("first_name")
            app["worker_last_name"] = worker.get("last_name")
            app["worker_phone"] = worker.get("phone")
        result.append(app)
    return result

@api_router.put("/applications/{app_id}")
async def update_app(app_id: str, payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    # Seul l'hôtel propriétaire du shift ou l'admin peut modifier
    app = await db.applications.find_one({"id": app_id})
    if not app:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    shift = await db.shifts.find_one({"id": app["shift_id"]})
    if not shift:
        raise HTTPException(status_code=404, detail="Mission non trouvée")
    if current_user["role"] != UserRole.ADMIN and shift["hotel_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Non autorisé")
    await db.applications.update_one({"id": app_id}, {"$set": payload})
    return {"status": "success"}

# Worker earnings
@api_router.get("/worker/earnings")
async def get_worker_earnings(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.WORKER:
        raise HTTPException(status_code=403, detail="Accès réservé aux workers")

    apps = await db.applications.find({
        "worker_id": current_user["id"],
        "status": {"$in": [ApplicationStatus.ACCEPTED, ApplicationStatus.COMPLETED]}
    }).to_list(100)

    total = 0
    details = []
    for app in apps:
        shift = await db.shifts.find_one({"id": app["shift_id"]})
        if shift:
            # Calcul de la durée en heures
            try:
                start_time = shift.get("start_time", "00:00")
                end_time = shift.get("end_time", "00:00")
                start = datetime.strptime(start_time, "%H:%M")
                end = datetime.strptime(end_time, "%H:%M")
                # Si l'heure de fin est <= l'heure de début, on ajoute 1 jour (mission de nuit)
                if end <= start:
                    end = end.replace(day=end.day + 1)
                duration = (end - start).total_seconds() / 3600  # en heures
            except Exception as e:
                logger.error(f"Erreur calcul durée pour shift {shift.get('id')}: {e}")
                duration = 0

            gain = shift.get("hourly_rate", 0) * duration
            total += gain
            details.append({
                "shift_id": shift["id"],
                "title": shift.get("title"),
                "hotel_name": shift.get("hotel_name"),
                "date": shift.get("dates", [""])[0] if shift.get("dates") else "",
                "start_time": shift.get("start_time"),
                "end_time": shift.get("end_time"),
                "duration": round(duration, 2),
                "hourly_rate": shift.get("hourly_rate"),
                "earned": round(gain, 2),
                "status": app["status"]
            })
    paid = sum(d["earned"] for d in details if d["status"] == ApplicationStatus.COMPLETED)
    pending = sum(d["earned"] for d in details if d["status"] == ApplicationStatus.ACCEPTED)
    return {"total_earnings": round(total, 2), "total": round(total, 2), "paid": round(paid, 2), "pending": round(pending, 2), "details": details}

# Stats worker
@api_router.get("/stats/worker")
async def worker_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.WORKER:
        raise HTTPException(status_code=403)
    total_apps = await db.applications.count_documents({"worker_id": current_user["id"]})
    accepted = await db.applications.count_documents({"worker_id": current_user["id"], "status": ApplicationStatus.ACCEPTED})
    pending = await db.applications.count_documents({"worker_id": current_user["id"], "status": ApplicationStatus.PENDING})
    rejected = await db.applications.count_documents({"worker_id": current_user["id"], "status": ApplicationStatus.REJECTED})
    completed = await db.applications.count_documents({"worker_id": current_user["id"], "status": ApplicationStatus.COMPLETED})
    return {
        "total_applications": total_apps,
        "accepted": accepted,
        "pending": pending,
        "rejected": rejected,
        "completed": completed,
        "success_rate": round(((accepted + completed) / total_apps * 100) if total_apps > 0 else 0, 1)
    }

# Stats hotel (déjà existant)
@api_router.get("/stats/hotel")
async def get_hotel_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.HOTEL:
        raise HTTPException(status_code=403)
    
    active_shifts = await db.shifts.count_documents({"hotel_id": current_user["id"], "status": ShiftStatus.OPEN})
    
    # Récupérer les IDs des shifts de cet hôtel
    hotel_shifts = await db.shifts.find({"hotel_id": current_user["id"]}, {"id": 1}).to_list(None)
    shift_ids = [s["id"] for s in hotel_shifts]
    
    pending_apps = await db.applications.count_documents({"shift_id": {"$in": shift_ids}, "status": ApplicationStatus.PENDING})
    
    monthly_spend = 0
    return {
        "active_shifts": active_shifts,
        "pending_applications": pending_apps,
        "monthly_spend": monthly_spend,
        "total_shifts": len(hotel_shifts)
    }

# Invoices
@api_router.get("/invoices/hotel")
@api_router.get("/invoices/worker")
@api_router.get("/worker/invoices")
@api_router.get("/hotel/invoices")
async def get_invoices(current_user: dict = Depends(get_current_user)):
    key = "hotel_id" if current_user["role"] == UserRole.HOTEL else "worker_id"
    invs = await db.invoices.find({key: current_user["id"]}).to_list(100)
    return [clean_mongo_doc(i) for i in invs]
@api_router.get("/invoices/{invoice_id}/download")
async def download_invoice(invoice_id: str, current_user: dict = Depends(get_current_user)):
    """Retourne les détails d'une facture pour génération PDF (service non intégré pour l'instant)"""
    invoice = await db.invoices.find_one({"id": invoice_id})
    if not invoice:
        raise HTTPException(status_code=404, detail="Facture non trouvée")
    invoice = clean_mongo_doc(invoice)
    # Vérifier l'accès
    if current_user.get("role") != "admin" and invoice.get("hotel_id") != current_user["id"] and invoice.get("worker_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Accès refusé")
    return {"invoice": invoice, "message": "Service de génération PDF non encore intégré"}
@api_router.post("/worker/invoices")
async def upload_worker_invoice(file: UploadFile = File(...), mission_id: str = Form(...), current_user: dict = Depends(get_current_user)):
    """Permet à un worker de transmettre sa facture pour une mission"""
    if current_user["role"] != UserRole.WORKER:
        raise HTTPException(status_code=403, detail="Réservé aux workers")
    try:
        upload_result = cloudinary.uploader.upload(file.file, resource_type="raw")
        url = upload_result.get("secure_url")
        invoice = {
            "id": str(uuid.uuid4()),
            "worker_id": current_user["id"],
            "shift_id": mission_id,
            "url": url,
            "filename": file.filename,
            "status": "submitted",
            "created_at": DateUtils.to_iso(DateUtils.now())
        }
        await db.invoices.insert_one(invoice)
        return clean_mongo_doc(invoice)
    except Exception as e:
        logger.error(f"Failed to upload worker invoice: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi de la facture")
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

# Support (routes communes + routes spécifiques worker/hotel)
@api_router.get("/support/threads")
@api_router.get("/support/threads/me")
async def get_threads(current_user: dict = Depends(get_current_user)):
    threads = await db.support_threads.find({"user_id": current_user["id"]}).sort("created_at", -1).to_list(100)
    return [clean_mongo_doc(t) for t in threads]

@api_router.get("/worker/support/threads")
async def get_worker_threads(current_user: dict = Depends(get_current_user)):
    threads = await db.support_threads.find({"user_id": current_user["id"]}).sort("created_at", -1).to_list(100)
    return [clean_mongo_doc(t) for t in threads]

@api_router.get("/hotel/support/threads")
async def get_hotel_threads(current_user: dict = Depends(get_current_user)):
    threads = await db.support_threads.find({"user_id": current_user["id"]}).sort("created_at", -1).to_list(100)
    return [clean_mongo_doc(t) for t in threads]

@api_router.get("/support/threads/{thread_id}")
async def get_thread_messages(thread_id: str, current_user: dict = Depends(get_current_user)):
    thread = await db.support_threads.find_one({"id": thread_id})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    # Vérifier que l'utilisateur a accès (propriétaire ou admin)
    if current_user.get("role") != "admin" and thread.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    messages = await db.support_messages.find({"thread_id": thread_id}).sort("created_at", 1).to_list(500)
    return [clean_mongo_doc(m) for m in messages]

@api_router.get("/worker/support/threads/{thread_id}")
async def get_worker_thread_messages(thread_id: str, current_user: dict = Depends(get_current_user)):
    thread = await db.support_threads.find_one({"id": thread_id, "user_id": current_user["id"]})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    messages = await db.support_messages.find({"thread_id": thread_id}).sort("created_at", 1).to_list(500)
    return [clean_mongo_doc(m) for m in messages]

@api_router.get("/hotel/support/threads/{thread_id}")
async def get_hotel_thread_messages(thread_id: str, current_user: dict = Depends(get_current_user)):
    thread = await db.support_threads.find_one({"id": thread_id, "user_id": current_user["id"]})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    messages = await db.support_messages.find({"thread_id": thread_id}).sort("created_at", 1).to_list(500)
    return [clean_mongo_doc(m) for m in messages]

@api_router.post("/support/threads/{thread_id}/messages")
async def post_thread_message(thread_id: str, payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    thread = await db.support_threads.find_one({"id": thread_id})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    if current_user.get("role") != "admin" and thread.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    is_admin = current_user.get("role") == "admin"
    message = {
        "id": str(uuid.uuid4()),
        "thread_id": thread_id,
        "sender_id": current_user["id"],
        "sender_email": current_user.get("email"),
        "sender_role": current_user.get("role"),
        "body": payload.get("body", ""),
        "is_admin": is_admin,
        "created_at": DateUtils.to_iso(DateUtils.now())
    }
    await db.support_messages.insert_one(message)
    # Mettre à jour le thread avec le dernier message
    await db.support_threads.update_one(
        {"id": thread_id},
        {"$set": {
            "last_message": payload.get("body", "")[:100],
            "last_message_at": DateUtils.to_iso(DateUtils.now()),
            "last_sender_role": current_user.get("role"),
            "status": "in_progress" if not is_admin else thread.get("status", "open")
        }}
    )
    return clean_mongo_doc(message)

@api_router.post("/worker/support/threads/{thread_id}/messages")
async def post_worker_thread_message(thread_id: str, payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    thread = await db.support_threads.find_one({"id": thread_id, "user_id": current_user["id"]})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    message = {
        "id": str(uuid.uuid4()),
        "thread_id": thread_id,
        "sender_id": current_user["id"],
        "sender_email": current_user.get("email"),
        "sender_role": current_user.get("role"),
        "body": payload.get("body", ""),
        "is_admin": False,
        "created_at": DateUtils.to_iso(DateUtils.now())
    }
    await db.support_messages.insert_one(message)
    await db.support_threads.update_one(
        {"id": thread_id},
        {"$set": {
            "last_message": payload.get("body", "")[:100],
            "last_message_at": DateUtils.to_iso(DateUtils.now()),
            "last_sender_role": "worker"
        }}
    )
    return clean_mongo_doc(message)

@api_router.post("/hotel/support/threads/{thread_id}/messages")
async def post_hotel_thread_message(thread_id: str, payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    thread = await db.support_threads.find_one({"id": thread_id, "user_id": current_user["id"]})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    message = {
        "id": str(uuid.uuid4()),
        "thread_id": thread_id,
        "sender_id": current_user["id"],
        "sender_email": current_user.get("email"),
        "sender_role": current_user.get("role"),
        "body": payload.get("body", ""),
        "is_admin": False,
        "created_at": DateUtils.to_iso(DateUtils.now())
    }
    await db.support_messages.insert_one(message)
    await db.support_threads.update_one(
        {"id": thread_id},
        {"$set": {
            "last_message": payload.get("body", "")[:100],
            "last_message_at": DateUtils.to_iso(DateUtils.now()),
            "last_sender_role": "hotel"
        }}
    )
    return clean_mongo_doc(message)

@api_router.post("/support/threads")
async def create_support_thread(payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    thread_id = str(uuid.uuid4())
    thread = {
        "id": thread_id,
        "user_id": current_user["id"],
        "user_email": current_user["email"],
        "user_role": current_user.get("role"),
        "subject": payload.get("subject"),
        "status": "open",
        "created_at": DateUtils.to_iso(DateUtils.now())
    }
    await db.support_threads.insert_one(thread)
    # Créer le premier message
    if payload.get("message"):
        first_message = {
            "id": str(uuid.uuid4()),
            "thread_id": thread_id,
            "sender_id": current_user["id"],
            "sender_email": current_user.get("email"),
            "sender_role": current_user.get("role"),
            "body": payload.get("message"),
            "is_admin": False,
            "created_at": DateUtils.to_iso(DateUtils.now())
        }
        await db.support_messages.insert_one(first_message)
        thread["last_message"] = payload.get("message", "")[:100]
        thread["last_message_at"] = DateUtils.to_iso(DateUtils.now())
    return clean_mongo_doc(thread)

@api_router.post("/worker/support/threads")
async def create_worker_support_thread(payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    thread_id = str(uuid.uuid4())
    thread = {
        "id": thread_id,
        "user_id": current_user["id"],
        "user_email": current_user["email"],
        "user_role": "worker",
        "subject": payload.get("subject"),
        "status": "open",
        "created_at": DateUtils.to_iso(DateUtils.now())
    }
    await db.support_threads.insert_one(thread)
    if payload.get("message"):
        first_message = {
            "id": str(uuid.uuid4()),
            "thread_id": thread_id,
            "sender_id": current_user["id"],
            "sender_email": current_user.get("email"),
            "sender_role": "worker",
            "body": payload.get("message"),
            "is_admin": False,
            "created_at": DateUtils.to_iso(DateUtils.now())
        }
        await db.support_messages.insert_one(first_message)
    return clean_mongo_doc(thread)

@api_router.post("/hotel/support/threads")
async def create_hotel_support_thread(payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    thread_id = str(uuid.uuid4())
    thread = {
        "id": thread_id,
        "user_id": current_user["id"],
        "user_email": current_user["email"],
        "user_role": "hotel",
        "subject": payload.get("subject"),
        "status": "open",
        "created_at": DateUtils.to_iso(DateUtils.now())
    }
    await db.support_threads.insert_one(thread)
    if payload.get("message"):
        first_message = {
            "id": str(uuid.uuid4()),
            "thread_id": thread_id,
            "sender_id": current_user["id"],
            "sender_email": current_user.get("email"),
            "sender_role": "hotel",
            "body": payload.get("message"),
            "is_admin": False,
            "created_at": DateUtils.to_iso(DateUtils.now())
        }
        await db.support_messages.insert_one(first_message)
    return clean_mongo_doc(thread)

# Admin
@api_router.get("/admin/stats")
async def admin_stats(current_user: dict = Depends(require_admin)):
    pending_workers = await db.users.count_documents({"role": "worker", "verification_status": "pending"})
    pending_hotels = await db.users.count_documents({"role": "hotel", "verification_status": "unverified"})
    return {
        "total_users": await db.users.count_documents({}),
        "total_workers": await db.users.count_documents({"role": "worker"}),
        "total_hotels": await db.users.count_documents({"role": "hotel"}),
        "pending_workers": pending_workers,
        "pending_hotels": pending_hotels,
        "pending_verifications": pending_workers + pending_hotels,
        "total_shifts": await db.shifts.count_documents({}),
        "revenue": 0,
        "open_support_threads": await db.support_threads.count_documents({"status": "open"}),
        "open_disputes": await db.disputes.count_documents({"status": "open"}),
        "pending_reviews": await db.ratings.count_documents({"verified": {"$ne": True}}),
        "shifts_today": await db.shifts.count_documents({"created_at": {"$gte": DateUtils.to_iso(datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0))}}),
        "active_users_7d": 0,
        "applications_today": await db.applications.count_documents({"created_at": {"$gte": DateUtils.to_iso(datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0))}})
    }

@api_router.get("/admin/users")
async def admin_users(
    current_user: dict = Depends(require_admin),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    role: Optional[str] = Query(None),
    verification: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    query = {}
    if role:
        query["role"] = role
    if verification:
        query["verification_status"] = verification
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"hotel_name": {"$regex": search, "$options": "i"}},
        ]
    total = await db.users.count_documents(query)
    skip = (page - 1) * limit
    users = await db.users.find(query, {"password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    def enrich_user(u):
        u = clean_mongo_doc(u)
        fn = u.get("first_name", "") or ""
        ln = u.get("last_name", "") or ""
        u["name"] = f"{fn} {ln}".strip() or u.get("email", "")
        return u
    return {
        "users": [enrich_user(u) for u in users],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, (total + limit - 1) // limit)
    }

@api_router.get("/admin/users/export")
async def export_users(current_user: dict = Depends(require_admin)):
    from fastapi.responses import StreamingResponse
    import io, csv
    users = await db.users.find({}, {"password_hash": 0}).to_list(None)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "email", "role", "first_name", "last_name", "hotel_name", "verification_status", "created_at"])
    for u in users:
        writer.writerow([u.get("id",""), u.get("email",""), u.get("role",""), u.get("first_name",""), u.get("last_name",""), u.get("hotel_name",""), u.get("verification_status",""), u.get("created_at","")])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=utilisateurs.csv"})

@api_router.get("/admin/users/{user_id}")
async def admin_get_user(user_id: str, current_user: dict = Depends(require_admin)):
    user = await db.users.find_one({"id": user_id}, {"password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user = clean_mongo_doc(user)
    # Récupérer les documents
    documents = await db.documents.find({"user_id": user_id}).to_list(100)
    user["documents"] = [clean_mongo_doc(d) for d in documents]
    # Récupérer les expériences
    experiences = await db.experiences.find({"user_id": user_id}).to_list(100)
    user["experiences"] = [clean_mongo_doc(e) for e in experiences]
    # Récupérer les suspensions
    suspensions = await db.suspensions.find({"user_id": user_id}).sort("suspended_at", -1).to_list(50)
    user["suspensions"] = [clean_mongo_doc(s) for s in suspensions]
    # Récupérer l'audit log de l'utilisateur
    audit_log = await db.audit_logs.find({"target_id": user_id}).sort("created_at", -1).to_list(50)
    user["audit_log"] = [clean_mongo_doc(a) for a in audit_log]
    # Stats missions
    if user.get("role") == "worker":
        total_apps = await db.applications.count_documents({"worker_id": user_id})
        completed = await db.applications.count_documents({"worker_id": user_id, "status": ApplicationStatus.COMPLETED})
        user["total_applications"] = total_apps
        user["total_completed"] = completed
    elif user.get("role") == "hotel":
        total_shifts = await db.shifts.count_documents({"hotel_id": user_id})
        user["total_shifts"] = total_shifts
    return {"user": user}

@api_router.get("/admin/verifications/pending")
async def pending_verifs(current_user: dict = Depends(require_admin)):
    workers_raw = await db.users.find({"role": "worker", "verification_status": "pending"}).to_list(100)
    hotels_raw = await db.users.find({"role": "hotel", "verification_status": "unverified"}).to_list(100)
    # Enrichir chaque worker avec ses documents et son nom
    workers_enriched = []
    for w in workers_raw:
        w = clean_mongo_doc(w)
        fn = w.get("first_name", "") or ""
        ln = w.get("last_name", "") or ""
        w["name"] = f"{fn} {ln}".strip() or w.get("email", "")
        docs = await db.documents.find({"user_id": w["id"]}).to_list(50)
        w["documents"] = [clean_mongo_doc(d) for d in docs]
        workers_enriched.append(w)
    hotels_enriched = []
    for h in hotels_raw:
        h = clean_mongo_doc(h)
        fn = h.get("first_name", "") or ""
        ln = h.get("last_name", "") or ""
        h["name"] = f"{fn} {ln}".strip() or h.get("email", "")
        docs = await db.documents.find({"user_id": h["id"]}).to_list(50)
        h["documents"] = [clean_mongo_doc(d) for d in docs]
        hotels_enriched.append(h)
    return {"workers": workers_enriched, "hotels": hotels_enriched}

@api_router.post("/admin/users/{user_id}/verify")
async def verify_user(user_id: str, payload: Dict[Any, Any], current_user: dict = Depends(require_admin)):
    status = payload.get("status")
    reason = payload.get("reason", "")
    if status not in ["verified", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'verified' or 'rejected'")
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    update_data = {"verification_status": status}
    if status == "rejected" and reason:
        update_data["rejection_reason"] = reason
    await db.users.update_one({"id": user_id}, {"$set": update_data})
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "admin_id": current_user["id"],
        "admin_email": current_user.get("email"),
        "action": f"user_{status}",
        "target_type": "user",
        "target_id": user_id,
        "target_email": user.get("email"),
        "details": {"reason": reason},
        "created_at": DateUtils.to_iso(DateUtils.now())
    })
    return {"status": "success", "message": f"User {status}"}

@api_router.put("/admin/users/{user_id}/suspend")
async def suspend_user(user_id: str, payload: Dict[Any, Any], current_user: dict = Depends(require_admin)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    action = payload.get("action", "suspend")  # suspend or unsuspend
    reason = payload.get("reason", "")
    duration_days = payload.get("duration_days", 0)
    if action == "suspend":
        suspended_until = None
        if duration_days and duration_days > 0:
            suspended_until = DateUtils.to_iso(DateUtils.now() + timedelta(days=duration_days))
        await db.users.update_one({"id": user_id}, {"$set": {"is_suspended": True, "suspended_until": suspended_until, "suspension_reason": reason}})
        await db.suspensions.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "admin_id": current_user["id"],
            "admin_email": current_user.get("email"),
            "suspended_by_email": current_user.get("email"),
            "reason": reason,
            "duration_days": duration_days,
            "suspended_until": suspended_until,
            "expires_at": suspended_until,
            "status": "active",
            "suspended_at": DateUtils.to_iso(DateUtils.now())
        })
        await db.audit_logs.insert_one({
            "id": str(uuid.uuid4()),
            "admin_id": current_user["id"],
            "admin_email": current_user.get("email"),
            "action": "user_suspended",
            "target_type": "user",
            "target_id": user_id,
            "target_email": user.get("email"),
            "details": {"reason": reason, "duration_days": duration_days},
            "created_at": DateUtils.to_iso(DateUtils.now())
        })
    else:
        await db.users.update_one({"id": user_id}, {"$set": {"is_suspended": False, "suspended_until": None, "suspension_reason": None}})
        await db.audit_logs.insert_one({
            "id": str(uuid.uuid4()),
            "admin_id": current_user["id"],
            "admin_email": current_user.get("email"),
            "action": "user_unbanned",
            "target_type": "user",
            "target_id": user_id,
            "target_email": user.get("email"),
            "details": {},
            "created_at": DateUtils.to_iso(DateUtils.now())
        })
    return {"status": "success"}

@api_router.post("/admin/users/{user_id}/reset-password")
async def admin_reset_password(user_id: str, payload: Dict[Any, Any], current_user: dict = Depends(require_admin)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_password = payload.get("new_password")
    if not new_password:
        # Générer un mot de passe aléatoire
        new_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    password_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    await db.users.update_one({"id": user_id}, {"$set": {"password_hash": password_hash}})
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "admin_id": current_user["id"],
        "admin_email": current_user.get("email"),
        "action": "password_reset_admin",
        "target_type": "user",
        "target_id": user_id,
        "target_email": user.get("email"),
        "details": {},
        "created_at": DateUtils.to_iso(DateUtils.now())
    })
    return {"status": "success", "new_password": new_password}

@api_router.put("/admin/documents/{doc_id}/status")
async def admin_update_document_status(doc_id: str, payload: Dict[Any, Any], current_user: dict = Depends(require_admin)):
    doc = await db.documents.find_one({"id": doc_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    new_status = payload.get("status")
    # Normaliser : "approved" -> "verified" pour cohérence avec le frontend
    if new_status == "approved":
        new_status = "verified"
    if new_status not in ["verified", "rejected", "pending"]:
        raise HTTPException(status_code=400, detail="Status must be verified, rejected or pending")
    reason = payload.get("reason", "")
    await db.documents.update_one({"id": doc_id}, {"$set": {"status": new_status, "rejection_reason": reason, "reviewed_at": DateUtils.to_iso(DateUtils.now()), "reviewed_by": current_user["id"]}})
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "admin_id": current_user["id"],
        "admin_email": current_user.get("email"),
        "action": f"document_{new_status}",
        "target_type": "document",
        "target_id": doc_id,
        "target_email": doc.get("user_id"),
        "details": {"reason": reason, "doc_type": doc.get("type")},
        "created_at": DateUtils.to_iso(DateUtils.now())
    })
    return {"status": "success"}
@api_router.get("/admin/support/threads")
async def admin_threads(
    current_user: dict = Depends(require_admin),
    q: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    query = {}
    if status:
        query["status"] = status
    if q:
        query["$or"] = [
            {"subject": {"$regex": q, "$options": "i"}},
            {"user_email": {"$regex": q, "$options": "i"}},
        ]
    threads = await db.support_threads.find(query).sort("created_at", -1).to_list(200)
    return [clean_mongo_doc(t) for t in threads]

@api_router.put("/admin/support/threads/{thread_id}")
async def admin_update_thread(thread_id: str, payload: Dict[Any, Any], current_user: dict = Depends(require_admin)):
    update = {}
    if "status" in payload:
        update["status"] = payload["status"]
    if payload.get("mark_admin_read"):
        update["admin_read"] = True
        update["admin_read_at"] = DateUtils.to_iso(DateUtils.now())
    if update:
        await db.support_threads.update_one({"id": thread_id}, {"$set": update})
    return {"status": "success"}

@api_router.get("/admin/shifts")
async def admin_shifts(
    current_user: dict = Depends(require_admin),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    query = {}
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"hotel_name": {"$regex": search, "$options": "i"}},
        ]
    total = await db.shifts.count_documents(query)
    skip = (page - 1) * limit
    shifts = await db.shifts.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    result = []
    for shift in shifts:
        shift = clean_mongo_doc(shift)
        # Récupérer les candidatures pour ce shift
        apps = await db.applications.find({"shift_id": shift["id"]}).to_list(100)
        shift["applications"] = [clean_mongo_doc(a) for a in apps]
        result.append(shift)
    return {
        "shifts": result,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, (total + limit - 1) // limit)
    }

@api_router.put("/admin/shifts/{shift_id}/assign")
async def admin_assign_shift(shift_id: str, payload: Dict[Any, Any], current_user: dict = Depends(require_admin)):
    worker_id = payload.get("worker_id")
    if not worker_id:
        raise HTTPException(status_code=400, detail="worker_id required")
    # Trouver ou créer une candidature
    existing = await db.applications.find_one({"shift_id": shift_id, "worker_id": worker_id})
    if existing:
        await db.applications.update_one({"shift_id": shift_id, "worker_id": worker_id}, {"$set": {"status": "accepted"}})
    else:
        worker = await db.users.find_one({"id": worker_id})
        if not worker:
            raise HTTPException(status_code=404, detail="Worker not found")
        app = {
            "id": str(uuid.uuid4()),
            "shift_id": shift_id,
            "worker_id": worker_id,
            "worker_name": f"{worker.get('first_name','')} {worker.get('last_name','')}".strip(),
            "worker_email": worker.get("email"),
            "status": "accepted",
            "created_at": DateUtils.to_iso(DateUtils.now()),
            "assigned_by_admin": True
        }
        await db.applications.insert_one(app)
    await db.shifts.update_one({"id": shift_id}, {"$set": {"status": "filled"}})
    return {"status": "success"}

@api_router.get("/admin/audit")
async def admin_audit(
    current_user: dict = Depends(require_admin),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    action: Optional[str] = Query(None),
    target_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    query = {}
    if action:
        query["action"] = action
    if target_type:
        query["target_type"] = target_type
    if search:
        query["$or"] = [
            {"admin_email": {"$regex": search, "$options": "i"}},
            {"target_email": {"$regex": search, "$options": "i"}},
        ]
    total = await db.audit_logs.count_documents(query)
    skip = (page - 1) * limit
    logs = await db.audit_logs.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return {
        "logs": [clean_mongo_doc(l) for l in logs],
        "total": total,
        "page": page,
        "limit": limit,
         "pages": max(1, (total + limit - 1) // limit)
    }
@api_router.get("/admin/audit/export")
async def admin_audit_export(current_user: dict = Depends(require_admin)):
    """Exporte tous les logs d'audit en CSV"""
    from fastapi.responses import StreamingResponse
    import io
    import csv
    logs = await db.audit_logs.find({}).sort("created_at", -1).to_list(None)
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id", "admin_email", "action", "target_type", "target_email", "created_at", "details"])
    writer.writeheader()
    for log in logs:
        log = clean_mongo_doc(log)
        writer.writerow({
            "id": log.get("id", ""),
            "admin_email": log.get("admin_email", ""),
            "action": log.get("action", ""),
            "target_type": log.get("target_type", ""),
            "target_email": log.get("target_email", ""),
            "created_at": log.get("created_at", ""),
            "details": str(log.get("details", ""))
        })
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit.csv"}
    )
@api_router.get("/admin/reviews")
async def admin_reviews(
    current_user: dict = Depends(require_admin),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    verified: Optional[str] = Query(None)
):
    query = {}
    if verified == "true":
        query["verified"] = True
    elif verified == "false":
        query["verified"] = {"$ne": True}
    total = await db.ratings.count_documents(query)
    skip = (page - 1) * limit
    reviews = await db.ratings.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return {
        "reviews": [clean_mongo_doc(r) for r in reviews],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, (total + limit - 1) // limit)
    }

@api_router.put("/admin/reviews/{review_id}/verify")
async def admin_verify_review(review_id: str, current_user: dict = Depends(require_admin)):
    await db.ratings.update_one({"id": review_id}, {"$set": {"verified": True, "verified_at": DateUtils.to_iso(DateUtils.now()), "verified_by": current_user["id"]}})
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "admin_id": current_user["id"],
        "admin_email": current_user.get("email"),
        "action": "review_verified",
        "target_type": "review",
        "target_id": review_id,
        "details": {},
        "created_at": DateUtils.to_iso(DateUtils.now())
    })
    return {"status": "success"}

@api_router.put("/admin/reviews/{review_id}/hide")
async def admin_hide_review(review_id: str, current_user: dict = Depends(require_admin)):
    await db.ratings.update_one({"id": review_id}, {"$set": {"visible": False}})
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "admin_id": current_user["id"],
        "admin_email": current_user.get("email"),
        "action": "review_hidden",
        "target_type": "review",
        "target_id": review_id,
        "details": {},
        "created_at": DateUtils.to_iso(DateUtils.now())
    })
    return {"status": "success"}

@api_router.delete("/admin/reviews/{review_id}")
async def admin_delete_review(review_id: str, current_user: dict = Depends(require_admin)):
    await db.ratings.delete_one({"id": review_id})
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "admin_id": current_user["id"],
        "admin_email": current_user.get("email"),
        "action": "review_deleted",
        "target_type": "review",
        "target_id": review_id,
        "details": {},
        "created_at": DateUtils.to_iso(DateUtils.now())
    })
    return {"status": "success"}

@api_router.post("/admin/users")
async def admin_create_user(payload: Dict[Any, Any], current_user: dict = Depends(require_admin)):
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email requis")
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    password = payload.get("password")
    if not password:
        password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    new_user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "password_hash": password_hash,
        "role": payload.get("role", "admin"),
        "first_name": payload.get("first_name", ""),
        "last_name": payload.get("last_name", ""),
        "verification_status": "verified",
        "created_at": DateUtils.to_iso(DateUtils.now()),
        "created_by": current_user["id"]
    }
    await db.users.insert_one(new_user)
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "admin_id": current_user["id"],
        "admin_email": current_user.get("email"),
        "action": "admin_created",
        "target_type": "user",
        "target_id": new_user["id"],
        "target_email": email,
        "details": {"role": new_user["role"]},
        "created_at": DateUtils.to_iso(DateUtils.now())
    })
    return {"status": "success", "user": clean_mongo_doc({k: v for k, v in new_user.items() if k != "password_hash"}), "generated_password": password}

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
# Ratings & Reviews
@api_router.post("/ratings")
async def create_rating(payload: Dict[Any, Any], current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "hotel":
        raise HTTPException(status_code=403, detail="Seuls les hôtels peuvent laisser des avis")
    rating = {
        "id": str(uuid.uuid4()),
        "hotel_id": current_user["id"],
        "hotel_name": current_user.get("hotel_name", ""),
        "shift_id": payload.get("shift_id"),
        "worker_id": payload.get("worker_id"),
        "rating": payload.get("rating", 5),
        "comment": payload.get("comment", ""),
        "for_landing_page": payload.get("for_landing_page", False),
        "verified": False,
        "visible": True,
        "created_at": DateUtils.to_iso(DateUtils.now())
    }
    await db.ratings.insert_one(rating)
    return clean_mongo_doc(rating)

@api_router.get("/ratings/public")
@api_router.get("/reviews")
async def get_public_ratings(limit: int = Query(20), verified: Optional[bool] = Query(None)):
    """Retourne les avis vérifiés pour la landing page"""
    query = {"visible": True}
    if verified is not None:
        query["verified"] = verified
    else:
        query["verified"] = True  # Par défaut, uniquement les avis vérifiés
    reviews = await db.ratings.find(query).sort("created_at", -1).to_list(limit)
    return [clean_mongo_doc(r) for r in reviews]

@api_router.get("/workers/{worker_id}/public")
async def get_worker_public_profile(worker_id: str, current_user: dict = Depends(get_current_user)):
    """Profil public d'un worker (pour les hôtels et admins)"""
    worker = await db.users.find_one({"id": worker_id, "role": "worker"}, {"password_hash": 0})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    worker = clean_mongo_doc(worker)
    # Stats
    total_completed = await db.applications.count_documents({"worker_id": worker_id, "status": ApplicationStatus.COMPLETED})
    total_apps = await db.applications.count_documents({"worker_id": worker_id})
    # Note moyenne
    ratings = await db.ratings.find({"worker_id": worker_id, "verified": True}).to_list(100)
    avg_rating = round(sum(r.get("rating", 0) for r in ratings) / len(ratings), 1) if ratings else None
    worker["total_completed"] = total_completed
    worker["total_applications"] = total_apps
    worker["avg_rating"] = avg_rating
    worker["ratings_count"] = len(ratings)
    # Supprimer les infos sensibles
    for key in ["date_of_birth", "address", "postal_code", "billing_address", "billing_postal_code", "iban", "bic"]:
        worker.pop(key, None)
    return worker

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
async def admin_revenue(current_user: dict = Depends(require_admin)):
    shifts = await db.shifts.find({}).to_list(None)
    total_revenue = 0
    for s in shifts:
        rate = s.get("hourly_rate", 0)
        total_revenue += rate * 0.15
    return {
        "total_revenue": round(total_revenue, 2),
        "commission_rate": 0.15
    }

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10000)
