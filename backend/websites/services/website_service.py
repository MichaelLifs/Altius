from sqlalchemy.orm import Session
from typing import List
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
sys.path.append(str(Path(__file__).parent.parent.parent.parent))
from websites.repositories.website_repository import WebsiteRepository
from websites.models.website_model import Website


class WebsiteService:
    def __init__(self, db: Session):
        self.repository = WebsiteRepository(db)

    def get_all_websites(self) -> List[Website]:
        return self.repository.get_all()

    def get_user_accessible_websites(self, user_id: int, user_role: str = None) -> List[Website]:
        return self.repository.get_user_accessible_websites(user_id, user_role)

    def check_user_has_access(self, user_id: int, website_id: str) -> bool:
        return self.repository.check_user_has_access(user_id, website_id)


