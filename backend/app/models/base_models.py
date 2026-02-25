from beanie import Document, Indexed
from pydantic import Field
from typing import List, Optional, Any, Dict
import datetime
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class User(Document):
    name: str = Indexed(str)
    email: str = Indexed(str, unique=True)
    password: str
    role: UserRole = UserRole.USER
    profile_picture: Optional[str] = None
    progress: Dict[str, Any] = Field(default_factory=dict)
    saved_blogs: List[Any] = Field(default_factory=list)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

    class Settings:
        name = "users"

class Blog(Document):
    title: str = Indexed(str)
    slug: str = Indexed(str, unique=True)
    content: str
    category: Optional[str] = Indexed(str, default=None)
    tags: List[str] = Field(default_factory=list)
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    is_published: bool = False
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

    class Settings:
        name = "blogs"



class Quiz(Document):
    title: str
    questions: List[Any] = Field(default_factory=list)
    difficulty: str
    course_id: Optional[str] = None

    class Settings:
        name = "quizzes"

class ChatHistory(Document):
    user_id: Optional[str] = None
    messages: List[Dict[str, Any]] = Field(default_factory=list)
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

    class Settings:
        name = "chat_history"

class UserDashboard(Document):
    user_id: str = Indexed(str, unique=True)
    lessons_done: int = 0
    tutor_sessions: int = 0
    badges: int = 1
    xp: int = 0
    achievements: List[str] = Field(default_factory=lambda: ["New Member"])
    class Settings:
        name = "user_dashboards"

class ContactMessage(Document):
    name: str
    email: str
    subject: str
    message: str
    phone: Optional[str] = None
    rating: Optional[int] = None
    status: str = "unread"
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

    class Settings:
        name = "contact_messages"

class OTPRecord(Document):
    """Temporary OTP storage — auto-deleted after 10 minutes via backend cleanup."""
    email: str = Indexed(str)
    otp: str
    purpose: str = "register"  # "register" or "login"
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    expires_at: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    )

    class Settings:
        name = "otp_records"
