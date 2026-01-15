from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import UserCreate, UserLogin, UserResponse, Token
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.supabase import supabase
from app.api import deps

router = APIRouter()


@router.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    response = (
        supabase.table("users").select("*").eq("email", login_data.email).execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_data = response.data[0]
    # Ensure password_hash is a string for verification
    password_hash = str(user_data.get("password_hash", ""))
    if not verify_password(login_data.password, password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=str(user_data.get("id")))
    return {"access_token": access_token, "token_type": "bearer", "user": user_data}


@router.post("/admin/register", response_model=UserResponse)
async def register_faculty(
    user_in: UserCreate,
    current_admin: UserResponse = Depends(deps.get_current_admin_user),
):
    # Check if user exists
    existing = supabase.table("users").select("id").eq("email", user_in.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pwd = get_password_hash(user_in.password)
    new_user = {
        "email": user_in.email,
        "password_hash": hashed_pwd,
        "name": user_in.name,
        "role": user_in.role,
    }

    response = supabase.table("users").insert(new_user).execute()

    # Check if response.data is populated (it should be if insert is successful)
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create user")

    return response.data[0]


@router.get("/auth/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(deps.get_current_user)):
    return current_user
