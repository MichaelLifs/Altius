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
        login_data: LoginRequest,
        db: Session = Depends(get_db)
    ) -> LoginResponse:
        try:
            from users.repositories.user_repository import UserRepository
            
            repository = UserRepository(db)
            user = repository.get_by_email(login_data.email)
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            if not repository.verify_password(login_data.password, user.password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            token_data = {
                "sub": str(user.id),
                "email": user.email,
                "user_id": user.id,
                "role": user.role
            }
            token = create_access_token(data=token_data)
            
            from users.schemas.user_schemas import LoginUserResponse
            user_response = LoginUserResponse(
                id=user.id,
                name=user.name,
                last_name=user.last_name,
                email=user.email,
                role=user.role,
                deleted=user.deleted,
                created_at=user.created_at,
                updated_at=user.updated_at,
                is_verified=True,  # Default to True for existing users
                token=token
            )
            
            response = LoginResponse(
                success=True,
                message="Login successful",
                data=user_response
            )
            return response
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred during login: {str(e)}"
            )
    
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

