from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from app.models.base_models import Blog
from app.schemas.blog import BlogCreate, BlogOut, BlogGenerate
from beanie import PydanticObjectId

router = APIRouter(prefix="/blogs", tags=["blogs"])

@router.get("/stats")
async def get_blog_stats():
    total_blogs = await Blog.count()
    return {
        "total_blogs": total_blogs,
        "active_users": 1, # Mock for now
        "blog_views": "1.2K", # Mock for now
        "engagement": "85%" # Mock for now
    }

@router.post("/", response_model=BlogOut)
async def create_blog(blog_in: BlogCreate):
    db_blog = Blog(**blog_in.model_dump())
    await db_blog.insert()
    return db_blog

@router.get("/", response_model=List[BlogOut])
async def list_blogs(category: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = Blog.find()
    if category:
        query = Blog.find(Blog.category == category)
    blogs = await query.skip(skip).limit(limit).to_list()
    return blogs

@router.get("/{slug}", response_model=BlogOut)
async def get_blog(slug: str):
    blog = await Blog.find_one(Blog.slug == slug)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog(blog_id: str):
    try:
        oid = PydanticObjectId(blog_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid blog ID format")
    blog = await Blog.get(oid)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    await blog.delete()


@router.post("/generate", response_model=BlogCreate)
def generate_blog_ai(request: BlogGenerate):
    # Stub for AI generation integration
    return {
        "title": f"AI Generated: {request.topic}",
        "slug": f"ai-generated-{request.topic.lower().replace(' ', '-')}",
        "content": "AI generated content will go here...",
        "category": "GenAI",
        "tags": ["AI", "Auto-generated"],
        "seo_title": f"Learn about {request.topic}",
        "seo_description": f"An AI-generated guide to {request.topic}"
    }
