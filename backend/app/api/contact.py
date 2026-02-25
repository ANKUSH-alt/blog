from fastapi import APIRouter, Depends, HTTPException, status
from app.models.base_models import ContactMessage, User, UserRole
from app.api.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/contact", tags=["contact"])

class ContactCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    phone: Optional[str] = None
    rating: Optional[int] = None

@router.post("/")
async def submit_contact(data: ContactCreate):
    new_message = ContactMessage(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
        phone=data.phone,
        rating=data.rating,
        status="unread"
    )
    await new_message.insert()
    return {"message": "Message received successfully."}

@router.get("/")
async def get_messages(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view messages"
        )
    # Sort by newest first
    messages = await ContactMessage.find().sort("-created_at").to_list()
    return messages

@router.put("/{msg_id}/read")
async def mark_message_read(msg_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    from bson import ObjectId
    msg = await ContactMessage.get(ObjectId(msg_id))
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    msg.status = "read"
    await msg.save()
    return {"message": "Message marked as read"}
