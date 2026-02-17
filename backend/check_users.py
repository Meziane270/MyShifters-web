import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
import os
from dotenv import load_dotenv
import bcrypt

async def check_users():
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
        
        async for user in users_cursor:
            count += 1
            email = user.get("email")
            role = user.get("role")
            password_hash = user.get("password_hash", "")
            print(f"User: {email} | Role: {role} | Hash: {password_hash[:10]}...")
            
        print(f"Total users found: {count}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_users())
