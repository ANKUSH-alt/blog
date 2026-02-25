from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from typing import List, Type
from app.core.config import settings

async def init_db(models: List[Type]):
    """
    Initialize the MongoDB connection and Beanie models.
    """
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]
    
    await init_beanie(
        database=db,
        document_models=models
    )
