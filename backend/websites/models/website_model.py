from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
sys.path.append(str(Path(__file__).parent.parent.parent.parent))
from database.db_config import Base


class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    url = Column(String(255), nullable=True)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user_access = relationship("UserWebsiteAccess", back_populates="website", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "website_id": self.website_id,
            "name": self.name,
            "url": self.url,
            "active": self.active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class UserWebsiteAccess(Base):
    __tablename__ = "user_website_access"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    website_id = Column(Integer, ForeignKey("websites.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())

    website = relationship("Website", back_populates="user_access")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "website_id": self.website_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


