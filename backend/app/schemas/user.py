from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime

class UserBase(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_picture: Optional[str] = None
    role: Optional[str] = "user"

class UserCreate(UserBase):
    email: EmailStr
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserOut(UserBase):
    id: str = Field(None, alias="_id")
    created_at: datetime
    
    @field_validator("id", mode="before")
    def convert_objectid_to_str(cls, v):
        return str(v) if v else None

    class Config:
        populate_by_name = True
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
