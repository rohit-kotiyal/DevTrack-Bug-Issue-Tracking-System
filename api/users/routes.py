from fastapi import APIRouter, HTTPException, Depends
from django.contrib.auth import authenticate
from users.models import User
from api.users.schemas import UserCreate, UserLogin, TokenResponse
from api.core.security import create_access_token
from api.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def register(user_data: UserCreate):
    if User.objects.filter(email=user_data.email).exists():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User.objects.create_user(
        email=user_data.email,
        password=user_data.password
    )
    user.name = user_data.name
    user.save()

    return {"message": "User registered successfully"}

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    user = authenticate(
        email=credentials.email,
        password=credentials.password
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token}

@router.get("/me") 
def me(user=Depends(get_current_user)):
    """
    Protected route that returns the current user's info.
    Only accessible with a valid JWT token.
    """
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name
    }