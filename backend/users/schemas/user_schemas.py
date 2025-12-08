"""
Pydantic schemas for user validation
"""
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="User first name")
    last_name: str = Field(..., min_length=1, max_length=100, description="User last name")
    email: EmailStr = Field(..., description="User email address")
    role: Optional[str] = Field(None, max_length=50, description="User role")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="User password (min 6 characters)")

    @field_validator('name', 'last_name')
    @classmethod
    def validate_name_fields(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[str] = Field(None, max_length=50)

    @field_validator('name', 'last_name', mode='before')
    @classmethod
    def validate_optional_name_fields(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and (not v or not v.strip()):
            raise ValueError('Field cannot be empty')
        return v.strip() if v else None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    last_name: str
    email: str
    role: Optional[str]
    deleted: bool
    created_at: datetime
    updated_at: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class LoginUserResponse(UserResponse):
    """User response with token for login"""
    is_verified: bool = True  # Default to True for existing users
    token: Optional[str] = None


class LoginResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[LoginUserResponse] = None


class UserListResponse(BaseModel):
    success: bool
    count: int
    data: list[UserResponse]


class UserDetailResponse(BaseModel):
    success: bool
    data: UserResponse
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    success: bool
    message: str
    errors: Optional[list[dict]] = None

