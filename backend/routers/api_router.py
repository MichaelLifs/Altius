from fastapi import APIRouter
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from users.routes.user_routes import router as users_router
from credentials.routes.credentials_routes import router as credentials_router
from websites.routes.website_routes import router as websites_router

api_router = APIRouter(prefix="/api")

api_router.include_router(users_router)
api_router.include_router(credentials_router)
api_router.include_router(websites_router)

