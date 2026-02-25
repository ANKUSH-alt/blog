from typing import Optional, List, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from beanie import PydanticObjectId

class BlogBase(BaseModel):
    title: str
    content: str
    category: str
    tags: Optional[List[str]] = []
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class BlogCreate(BlogBase):
    slug: str

class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    is_published: Optional[bool] = None

class BlogOut(BlogBase):
    id: str = Field(None, alias="_id")
    slug: str
    is_published: bool
    created_at: datetime
    
    @field_validator("id", mode="before")
    def convert_objectid_to_str(cls, v):
        return str(v) if v else None

    class Config:
        populate_by_name = True
        from_attributes = True

class BlogGenerate(BaseModel):
    topic: str
    difficulty: str
    word_count: int
    include_code: bool
    include_diagrams: bool = False

