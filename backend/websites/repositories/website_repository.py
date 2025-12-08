from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, List
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
sys.path.append(str(Path(__file__).parent.parent.parent.parent))
from websites.models.website_model import Website, UserWebsiteAccess


class WebsiteRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Website]:
        return self.db.query(Website).filter(Website.active == True).order_by(Website.id).all()

    def get_by_id(self, website_id: int) -> Optional[Website]:
        return self.db.query(Website).filter(
            and_(Website.id == website_id, Website.active == True)
        ).first()

    def get_by_website_id(self, website_id: str) -> Optional[Website]:
        # Convert to lowercase for case-insensitive search
        website_id_lower = website_id.lower() if website_id else None
        return self.db.query(Website).filter(
            and_(Website.website_id.ilike(website_id_lower), Website.active == True)
        ).first()

    def get_user_accessible_websites(self, user_id: int, user_role: str = None) -> List[Website]:
        # If user is admin or role is None/not set, return all active websites
        if user_role == 'admin' or user_role is None:
            return self.db.query(Website).filter(
                Website.active == True
            ).order_by(Website.id).all()
        
        # Otherwise, return only websites the user has access to
        return self.db.query(Website).join(
            UserWebsiteAccess
        ).filter(
            and_(
                UserWebsiteAccess.user_id == user_id,
                Website.active == True
            )
        ).order_by(Website.id).all()

    def check_user_has_access(self, user_id: int, website_id: str) -> bool:
        # Convert to lowercase for case-insensitive search
        website_id_lower = website_id.lower() if website_id else None
        access = self.db.query(UserWebsiteAccess).join(
            Website
        ).filter(
            and_(
                UserWebsiteAccess.user_id == user_id,
                Website.website_id.ilike(website_id_lower),
                Website.active == True
            )
        ).first()
        return access is not None


