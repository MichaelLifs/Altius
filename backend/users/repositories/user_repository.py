from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, List
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
sys.path.append(str(Path(__file__).parent.parent.parent.parent))
from users.models.user_model import User
from users.schemas.user_schemas import UserCreate, UserUpdate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[User]:
        return self.db.query(User).filter(User.deleted == False).order_by(User.id).all()

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(
            and_(User.id == user_id, User.deleted == False)
        ).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(
            and_(User.email.ilike(email), User.deleted == False)
        ).first()

    def create(self, user_data: UserCreate) -> User:
        hashed_password = pwd_context.hash(user_data.password)
        db_user = User(
            name=user_data.name,
            last_name=user_data.last_name,
            email=user_data.email,
            password=hashed_password,
            role=user_data.role
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update(self, user_id: int, user_data: UserUpdate) -> Optional[User]:
        db_user = self.get_by_id(user_id)
        if not db_user:
            return None

        update_data = user_data.model_dump(exclude_unset=True)
        
        if "password" in update_data:
            update_data["password"] = pwd_context.hash(update_data["password"])

        for field, value in update_data.items():
            setattr(db_user, field, value)

        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def delete(self, user_id: int) -> Optional[User]:
        db_user = self.get_by_id(user_id)
        if not db_user:
            return None

        db_user.deleted = True
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def get_by_role(self, role: str) -> List[User]:
        return self.db.query(User).filter(
            and_(User.role == role, User.deleted == False)
        ).order_by(User.id).all()

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

