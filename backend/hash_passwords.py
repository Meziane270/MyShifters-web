import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
import os
from dotenv import load_dotenv
import bcrypt

async def hash_all_passwords():
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
        
        users_cursor = db.users.find({})
        count = 0
        updated = 0
        
        async for user in users_cursor:
            count += 1
            stored_hash = user.get("password_hash", "")
            
            # Check if it's already a bcrypt hash (usually starts with $2b$ or $2a$)
            if stored_hash.startswith("$2b$") or stored_hash.startswith("$2a$"):
                continue
            
            # If not, hash it
            new_hash = bcrypt.hashpw(stored_hash.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            await db.users.update_one({"_id": user["_id"]}, {"$set": {"password_hash": new_hash}})
            print(f"Updated password for: {user.get('email')}")
            updated += 1
            
        print(f"Finished. Checked {count} users, updated {updated} passwords.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(hash_all_passwords())
