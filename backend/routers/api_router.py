from fastapi import APIRouter
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from users.routes.user_routes import router as users_router

api_router = APIRouter(prefix="/api")

api_router.include_router(users_router)

