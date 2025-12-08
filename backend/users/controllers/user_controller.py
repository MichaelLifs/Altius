from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
sys.path.append(str(Path(__file__).parent.parent.parent.parent))
from database.db_config import get_db
from users.services.user_service import UserService
from users.schemas.user_schemas import (
    UserCreate,
    UserUpdate,
    LoginRequest,
    LoginResponse,
    UserListResponse,
    UserDetailResponse
)
from auth import create_access_token


class UserController:
    def __init__(self):
        pass
    
    async def login(
        self,
        login_data: LoginRequest
    ) -> LoginResponse:
        # MOCK LOGIN - Always succeeds, no database check
        from datetime import datetime
        from users.schemas.user_schemas import LoginUserResponse
        
        # Create mock user data
        token_data = {
            "sub": "1",
            "email": login_data.email,
            "user_id": 1,
            "role": "admin"
        }
        token = create_access_token(data=token_data)
        
        user_response = LoginUserResponse(
            id=1,
            name="Mock",
            last_name="User",
            email=login_data.email,
            role="admin",
            deleted=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            is_verified=True,
            token=token
        )
        
        response = LoginResponse(
            success=True,
            message="Login successful (MOCK)",
            data=user_response
        )
        return response
    
    async def get_all_users(
        self,
        db: Session = Depends(get_db)
    ) -> UserListResponse:
        service = UserService(db)
        users = service.get_all_users()
        return UserListResponse(success=True, count=len(users), data=users)
    
    async def get_user_by_id(
        self,
        user_id: int,
        db: Session = Depends(get_db)
    ) -> UserDetailResponse:
        service = UserService(db)
        user = service.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserDetailResponse(success=True, data=user)
    
    async def create_user(
        self,
        user_data: UserCreate,
        db: Session = Depends(get_db)
    ) -> UserDetailResponse:
        service = UserService(db)
        try:
            user = service.create_user(user_data)
            return UserDetailResponse(
                success=True,
                data=user,
                message="User created successfully"
            )
        except ValueError as e:
            if "Email already exists" in str(e):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already exists"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    
    async def update_user(
        self,
        user_id: int,
        user_data: UserUpdate,
        db: Session = Depends(get_db)
    ) -> UserDetailResponse:
        service = UserService(db)
        try:
            user = service.update_user(user_id, user_data)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            return UserDetailResponse(
                success=True,
                data=user,
                message="User updated successfully"
            )
        except ValueError as e:
            if "Email already exists" in str(e):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already exists"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    
    async def delete_user(
        self,
        user_id: int,
        db: Session = Depends(get_db)
    ) -> UserDetailResponse:
        service = UserService(db)
        user = service.delete_user(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserDetailResponse(
            success=True,
            data=user,
            message="User deleted successfully"
        )
    
    async def get_users_by_role(
        self,
        role: str,
        db: Session = Depends(get_db)
    ) -> UserListResponse:
        service = UserService(db)
        users = service.get_users_by_role(role)
        return UserListResponse(success=True, count=len(users), data=users)

