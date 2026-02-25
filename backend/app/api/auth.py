from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from app.models.base_models import User, UserDashboard, OTPRecord
from app.schemas.user import UserCreate, UserOut, Token
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.email import send_otp_email, generate_otp
from datetime import datetime, timedelta
from jose import jwt, JWTError
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await User.find_one(User.email == username)
    if user is None:
        raise credentials_exception
    return user

from app.models.base_models import User, UserDashboard

@router.post("/register", response_model=UserOut)
async def register(user_in: UserCreate):
    user = await User.find_one(User.email == user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password=hashed_password,
        role=user_in.role
    )
    await new_user.insert()
    
    # Initialize default dashboard
    new_dashboard = UserDashboard(user_id=str(new_user.id))
    await new_dashboard.insert()
    
    return new_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await User.find_one(User.email == form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ── OTP Endpoints ──────────────────────────────────────────────

class OTPRequest(BaseModel):
    email: str
    purpose: str = "register"  # "register" or "login"

class OTPVerify(BaseModel):
    email: str
    otp: str
    purpose: str = "register"

@router.post("/send-otp")
async def send_otp(body: OTPRequest):
    """Generate and email a 6-digit OTP. Rate-limited to one per email at a time."""
    # Delete any existing OTPs for this email+purpose
    existing = await OTPRecord.find(
        OTPRecord.email == body.email,
        OTPRecord.purpose == body.purpose
    ).to_list()
    for rec in existing:
        await rec.delete()

    otp = generate_otp()
    record = OTPRecord(email=body.email, otp=otp, purpose=body.purpose)
    await record.insert()

    try:
        await send_otp_email(body.email, otp, purpose=body.purpose)
    except Exception as e:
        # If email fails, still return success with OTP in dev for testing
        import os
        if os.getenv("ENV", "dev") != "production":
            return {"message": "OTP generated (email unavailable in dev)", "dev_otp": otp}
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    return {"message": "OTP sent to your email"}

@router.post("/verify-otp")
async def verify_otp(body: OTPVerify):
    """Verify the OTP. Returns JWT for login, or a verified flag for registration."""
    record = await OTPRecord.find_one(
        OTPRecord.email == body.email,
        OTPRecord.purpose == body.purpose
    )
    if not record:
        raise HTTPException(status_code=400, detail="No OTP found. Please request a new one.")

    if datetime.utcnow() > record.expires_at:
        await record.delete()
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    if record.otp != body.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP. Please try again.")

    # OTP is valid — delete it
    await record.delete()

    if body.purpose == "login":
        user = await User.find_one(User.email == body.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        access_token = create_access_token(
            subject=user.email,
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {"access_token": access_token, "token_type": "bearer", "verified": True}

    # For register: just confirm the email is verified
    return {"verified": True, "message": "Email verified successfully"}

class OAuthUserIn(BaseModel):
    name: str
    email: str
    provider: str
    provider_id: str
    avatar: str | None = None

@router.post("/oauth", response_model=Token)
async def oauth_login(user_in: OAuthUserIn):
    """Handle OAuth sign-in from Google/GitHub via NextAuth. Creates user if not exists."""
    user = await User.find_one(User.email == user_in.email)
    if not user:
        # Auto-register OAuth user with a random password (they'll always use OAuth)
        import secrets
        random_pw = get_password_hash(secrets.token_hex(32))
        user = User(
            name=user_in.name,
            email=user_in.email,
            password=random_pw,
            profile_picture=user_in.avatar,
        )
        await user.insert()
        new_dashboard = UserDashboard(user_id=str(user.id))
        await new_dashboard.insert()
    elif user_in.avatar and not user.profile_picture:
        user.profile_picture = user_in.avatar
        await user.save()

    access_token = create_access_token(
        subject=user.email,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

from app.schemas.user import UserUpdate

@router.put("/me", response_model=UserOut)
async def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update the current user's profile.
    """
    if user_in.name is not None:
        current_user.name = user_in.name
        
    if user_in.email is not None and user_in.email != current_user.email:
        # Check if email is already taken
        existing_user = await User.find_one(User.email == user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_in.email

    if user_in.password is not None:
        current_user.password = get_password_hash(user_in.password)

    await current_user.save()
    return current_user

import os
import uuid

@router.post("/me/avatar", response_model=UserOut)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a profile picture for the current user.
    """
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only standard images are allowed."
        )

    # Generate a unique filename
    filename = f"{uuid.uuid4()}{ext}"
    os.makedirs("uploads/profiles", exist_ok=True)
    file_path = os.path.join("uploads/profiles", filename)

    # Save the file
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )

    # Update user profile picture path
    current_user.profile_picture = f"/uploads/profiles/{filename}"
    await current_user.save()
    
    return current_user

from typing import List

@router.get("/users", response_model=List[UserOut])
async def get_all_users(current_user: User = Depends(get_current_user)):
    """
    Get all users. Restricted to admin only.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this resource"
        )
    
    users = await User.find_all().to_list()
    return users
