import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
import os
from dotenv import load_dotenv
import bcrypt
import uuid

async def create_admin():
    load_dotenv()
    # On essaie de récupérer l'URL du .env ou des variables système
    MONGO_URL = os.environ.get("MONGO_URL", "mongodb+srv://connectApi:azv7rJSCU2lPa0D2@myshifterscluster.ejbubv2.mongodb.net/myshifters?retryWrites=true&w=majority&appName=MyShiftersCluster")
    DB_NAME = os.environ.get("DB_NAME", "myshifters")
    
    print(f"Connecting to MongoDB...")
    try:
        client = AsyncIOMotorClient(MONGO_URL, tls=True, tlsCAFile=certifi.where())
        db = client[DB_NAME]
        
        email = "oulmasmeziane@outlook.com"
        password = "AdminPassword2026!" # Mot de passe sécurisé par défaut
        
        existing = await db.users.find_one({"email": email})
        if existing:
            print(f"User {email} already exists. Updating to admin role...")
            await db.users.update_one({"email": email}, {"$set": {"role": "admin", "verification_status": "verified"}})
            return
            
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        
        new_user = {
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": password_hash,
            "role": "admin",
            "first_name": "Meziane",
            "last_name": "Oulmas",
            "verification_status": "verified",
            "created_at": "2026-02-20T00:00:00Z"
        }
        
        await db.users.insert_one(new_user)
        print(f"Admin user created successfully!")
        print(f"Email: {email}")
        print(f"Password: {password}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(create_admin())
