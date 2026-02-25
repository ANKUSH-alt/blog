import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.models.base_models import User
from app.core.security import get_password_hash
from beanie import init_beanie

async def reset_password():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]
    await init_beanie(database=db, document_models=[User])
    admin = await User.find_one(User.email == "admin@aiera.academy")
    if admin:
        admin.password = get_password_hash("adminpassword")
        await admin.save()
        print("Password reset successfully.")
    else:
        print("Admin user not found.")

asyncio.run(reset_password())
