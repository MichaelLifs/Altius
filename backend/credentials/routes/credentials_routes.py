from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
sys.path.append(str(Path(__file__).parent.parent.parent.parent))
from auth import create_access_token, get_current_user
from database.db_config import get_db
from websites.services.website_service import WebsiteService

router = APIRouter(prefix="/credentials", tags=["Credentials"])


class CredentialsRequest(BaseModel):
    website: str
    username: str
    password: str


class CredentialsResponse(BaseModel):
    success: bool
    message: str
    token: str
    deals: List[str]


@router.post("/submit", response_model=CredentialsResponse)
async def submit_credentials(
    credentials: CredentialsRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.get("user_id") or current_user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    
    try:
        user_id_int = int(user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token"
        )
    
    website_service = WebsiteService(db)
    
    # Convert website to lowercase for consistency (always store in lowercase)
    website_id_lower = credentials.website.lower() if credentials.website else None
    
    website = website_service.repository.get_by_website_id(website_id_lower)
    if not website:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Website '{credentials.website}' not found"
        )
    
    # Check if user has access (admin or None role has access to all websites)
    user_role = current_user.get("role")
    
    if user_role != 'admin' and user_role is not None:
        has_access = website_service.check_user_has_access(user_id_int, website_id_lower)
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You do not have permission to access this website. Please contact administrator."
            )
    
    if not credentials.username or not credentials.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required"
        )
    
    # Verify website credentials based on website_id (case-insensitive)
    # Password comparison is case-insensitive
    website_credentials = {
        "fo1": {
            "username": "fo1_test_user@whatever.com",
            "password": "Test123!"  # Will be compared case-insensitively
        },
        "fo2": {
            "username": "fo2_test_user@whatever.com",
            "password": "Test223!"  # Will be compared case-insensitively
        }
    }
    
    website_key = website_id_lower
    if website_key in website_credentials:
        expected_creds = website_credentials[website_key]
        # Username comparison is case-sensitive, password is case-insensitive
        username_match = credentials.username.lower() == expected_creds["username"].lower()
        password_match = credentials.password.lower() == expected_creds["password"].lower()
        
        if not username_match or not password_match:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password for this website"
            )
    
    token_data = {
        "website": website_id_lower,
        "website_id": website_id_lower,
        "username": credentials.username,
        "sub": credentials.username,
        "user_id": user_id_int
    }
    token = create_access_token(data=token_data)
    
    deals_map = {
        "fo1": [
            "EUR/USD - Long Position - Entry: 1.0850, Target: 1.0920",
            "GBP/USD - Short Position - Entry: 1.2650, Target: 1.2580",
            "USD/JPY - Long Position - Entry: 149.50, Target: 150.20"
        ],
        "fo2": [
            "AUD/USD - Long Position - Entry: 0.6520, Target: 0.6580",
            "USD/CAD - Short Position - Entry: 1.3650, Target: 1.3580",
            "EUR/GBP - Long Position - Entry: 0.8580, Target: 0.8630",
            "NZD/USD - Long Position - Entry: 0.5980, Target: 0.6040"
        ],
        "trading-pro": [
            "Gold Futures - Long Position - Entry: $2,045, Target: $2,065",
            "Crude Oil - Short Position - Entry: $78.50, Target: $76.00",
            "S&P 500 Index - Long Position - Entry: 4,520, Target: 4,580"
        ],
        "market-edge": [
            "Bitcoin - Long Position - Entry: $42,500, Target: $44,000",
            "Ethereum - Long Position - Entry: $2,350, Target: $2,500",
            "Apple Stock - Long Position - Entry: $185.50, Target: $192.00"
        ],
        "trade-master": [
            "Tesla Stock - Long Position - Entry: $245.00, Target: $255.00",
            "Amazon Stock - Long Position - Entry: $148.50, Target: $155.00",
            "Microsoft Stock - Long Position - Entry: $378.00, Target: $385.00"
        ]
    }
    
    deals = deals_map.get(website_key, [
        f"Deal 1 from {website.name}",
        f"Deal 2 from {website.name}",
        f"Deal 3 from {website.name}"
    ])
    
    return CredentialsResponse(
        success=True,
        message="Credentials submitted successfully",
        token=token,
        deals=deals
    )

