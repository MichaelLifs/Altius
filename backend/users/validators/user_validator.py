"""
User validators - additional validation functions
"""
from fastapi import HTTPException, status
from typing import Optional
import re


def validate_email(email: str) -> str:
    """
    Validate email format
    
    Args:
        email: Email string to validate
        
    Returns:
        Validated email (lowercased)
        
    Raises:
        HTTPException: If email format is invalid
    """
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    # Basic email validation pattern
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    return email.lower().strip()


def validate_password(password: str, min_length: int = 6) -> str:
    """
    Validate password strength
    
    Args:
        password: Password string to validate
        min_length: Minimum password length (default: 6)
        
    Returns:
        Validated password
        
    Raises:
        HTTPException: If password doesn't meet requirements
    """
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required"
        )
    
    if len(password) < min_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password must be at least {min_length} characters long"
        )
    
    return password


def validate_user_id(user_id: int) -> int:
    """
    Validate user ID
    
    Args:
        user_id: User ID to validate
        
    Returns:
        Validated user ID
        
    Raises:
        HTTPException: If user ID is invalid
    """
    if not isinstance(user_id, int) or user_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID. Must be a positive integer"
        )
    
    return user_id


def validate_name(name: str, field_name: str = "name") -> str:
    """
    Validate name field
    
    Args:
        name: Name string to validate
        field_name: Name of the field (for error messages)
        
    Returns:
        Validated name (trimmed)
        
    Raises:
        HTTPException: If name is invalid
    """
    if not name or not name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name.capitalize()} is required"
        )
    
    if len(name.strip()) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name.capitalize()} must not exceed 100 characters"
        )
    
    return name.strip()


def validate_role(role: Optional[str]) -> Optional[str]:
    """
    Validate role field
    
    Args:
        role: Role string to validate (can be None)
        
    Returns:
        Validated role (trimmed) or None
        
    Raises:
        HTTPException: If role is invalid
    """
    if role is None or role == "":
        return None
    
    if len(role.strip()) > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must not exceed 50 characters"
        )
    
    return role.strip() if role.strip() else None


