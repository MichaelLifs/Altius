"""
User type definitions - Type hints and type aliases
"""
from typing import Optional, TypedDict
from datetime import datetime


class UserDict(TypedDict, total=False):
    """User dictionary type"""
    id: int
    name: str
    last_name: str
    email: str
    password: Optional[str]
    role: Optional[str]
    deleted: bool
    created_at: datetime
    updated_at: datetime


class CreateUserData(TypedDict):
    """Data required to create a new user"""
    name: str
    last_name: str
    email: str
    password: str
    role: Optional[str]


class UpdateUserData(TypedDict, total=False):
    """Data for updating a user (all fields optional)"""
    name: str
    last_name: str
    email: str
    password: str
    role: Optional[str]


class LoginData(TypedDict):
    """Data for user login"""
    email: str
    password: str


UserPublicFields = dict

