from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class WebsiteResponse(BaseModel):
    id: int
    website_id: str
    name: str
    url: Optional[str]
    active: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class WebsiteListResponse(BaseModel):
    success: bool
    count: int
    data: List[WebsiteResponse]


