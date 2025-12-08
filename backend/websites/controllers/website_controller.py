from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
sys.path.append(str(Path(__file__).parent.parent.parent.parent))
from database.db_config import get_db
from websites.services.website_service import WebsiteService
from websites.schemas.website_schemas import WebsiteListResponse
from auth import get_current_user


class WebsiteController:
    def __init__(self):
        pass

    async def get_user_websites(
        self,
        current_user: dict = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> WebsiteListResponse:
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
        
        # Get user role from token
        user_role = current_user.get("role")
        
        service = WebsiteService(db)
        websites = service.get_user_accessible_websites(user_id_int, user_role)
        
        # Convert website_id to lowercase in response for consistency
        websites_data = []
        for website in websites:
            website_dict = website.to_dict()
            # Ensure website_id is always lowercase in response
            website_dict["website_id"] = website_dict["website_id"].lower() if website_dict["website_id"] else None
            websites_data.append(website_dict)
        
        return WebsiteListResponse(
            success=True,
            count=len(websites),
            data=websites_data
        )

