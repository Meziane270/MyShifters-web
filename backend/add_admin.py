import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
import os
from dotenv import load_dotenv
import bcrypt
import uuid

async def add_admin():
    load_dotenv()
    MONGO_URL = os.environ.get("MONGO_URL")
    DB_NAME = os.environ.get("DB_NAME", "myshifters")
    
    if not MONGO_URL:
        print("Error: MONGO_URL not found in .env")
        return

    print(f"Connecting to MongoDB...")
    try:
        client = AsyncIOMotorClient(MONGO_URL, tls=True, tlsCAFile=certifi.where())
        db = client[DB_NAME]
        
        email = "admin@myshifters.com"
        password = "AdminPassword123!"
        
        existing = await db.users.find_one({"email": email})
        if existing:
            print(f"User {email} already exists.")
            return
            
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        
        new_user = {
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": password_hash,
            "role": "admin",
            "first_name": "System",
            "last_name": "Admin",
            "verification_status": "verified",
            "created_at": "2024-01-01T00:00:00Z"
        }
        
        await db.users.insert_one(new_user)
        print(f"Admin user created successfully!")
        print(f"Email: {email}")
        print(f"Password: {password}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(add_admin())
