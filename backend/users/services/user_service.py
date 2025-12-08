from sqlalchemy.orm import Session
from typing import Optional, List
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
sys.path.append(str(Path(__file__).parent.parent.parent.parent))
from users.repositories.user_repository import UserRepository
from users.schemas.user_schemas import UserCreate, UserUpdate, UserResponse
from users.models.user_model import User


class UserService:
    def __init__(self, db: Session):
        self.repository = UserRepository(db)

    def get_all_users(self) -> List[UserResponse]:
        users = self.repository.get_all()
        return [UserResponse.model_validate(user.to_dict()) for user in users]

    def get_user_by_id(self, user_id: int) -> Optional[UserResponse]:
        user = self.repository.get_by_id(user_id)
        if not user:
            return None
        return UserResponse.model_validate(user.to_dict())

    def create_user(self, user_data: UserCreate) -> UserResponse:
        existing_user = self.repository.get_by_email(user_data.email)
        if existing_user:
            raise ValueError("Email already exists")

        user = self.repository.create(user_data)
        return UserResponse.model_validate(user.to_dict())

    def update_user(self, user_id: int, user_data: UserUpdate) -> Optional[UserResponse]:
        if user_data.email:
            existing_user = self.repository.get_by_email(user_data.email)
            if existing_user and existing_user.id != user_id:
                raise ValueError("Email already exists")

        user = self.repository.update(user_id, user_data)
        if not user:
            return None
        return UserResponse.model_validate(user.to_dict())

    def delete_user(self, user_id: int) -> Optional[UserResponse]:
        user = self.repository.delete(user_id)
        if not user:
            return None
        return UserResponse.model_validate(user.to_dict())

    def login(self, email: str, password: str) -> Optional[UserResponse]:
        user = self.repository.get_by_email(email)
        if not user:
            return None

        if not self.repository.verify_password(password, user.password):
            return None

        return UserResponse.model_validate(user.to_dict())

    def get_users_by_role(self, role: str) -> List[UserResponse]:
        users = self.repository.get_by_role(role)
        return [UserResponse.model_validate(user.to_dict()) for user in users]

