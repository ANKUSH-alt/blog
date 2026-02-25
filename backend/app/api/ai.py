from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.core.ai_service import AIService
from app.schemas.blog import BlogGenerate, BlogCreate

router = APIRouter(prefix="/ai", tags=["ai"])


# --- Request Body Models ---

class TutorRequest(BaseModel):
    message: str
    history: List[dict] = []

class AssistantRequest(BaseModel):
    message: str
    history: List[dict] = []
    system_prompt: str = "You are a helpful AI Assistant."

class QuizRequest(BaseModel):
    content: str


class ImageRequest(BaseModel):
    prompt: str


@router.post("/generate-image")
async def generate_image(request: ImageRequest):
    try:
        result = await AIService.generate_image(request.prompt)
        return {"url": result["url"], "prompt": result["prompt"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-blog", response_model=BlogCreate)
async def generate_blog(request: BlogGenerate):
    blog_data = await AIService.generate_blog(
        topic=request.topic,
        difficulty=request.difficulty,
        word_count=request.word_count,
        include_code=request.include_code,
        include_diagrams=request.include_diagrams
    )

    return {
        "title": blog_data["title"],
        "slug": request.topic.lower().replace(" ", "-"),
        "content": blog_data["content"],
        "category": "AI Generated",
        "tags": ["AI"],
        "seo_title": blog_data["seo_title"],
        "seo_description": blog_data["seo_description"]
    }

@router.post("/tutor")
async def ai_tutor(request: TutorRequest):
    response = await AIService.get_tutor_response(request.message, request.history)
    return {"response": response}

@router.post("/generate-quiz")
async def generate_quiz(request: QuizRequest):
    quiz = await AIService.generate_quiz(request.content)
    return {"quiz": quiz}

@router.post("/assistant")
async def ai_assistant(request: AssistantRequest):
    response = await AIService.get_assistant_response(request.message, request.history, request.system_prompt)
    return {"response": response}
