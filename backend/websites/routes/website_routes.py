from fastapi import APIRouter
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
sys.path.append(str(Path(__file__).parent.parent.parent.parent))
from websites.controllers.website_controller import WebsiteController
from websites.schemas.website_schemas import WebsiteListResponse

router = APIRouter(prefix="/websites", tags=["Websites"])

controller = WebsiteController()

router.add_api_route(
    "/user",
    controller.get_user_websites,
    methods=["GET"],
    response_model=WebsiteListResponse,
    summary="Get websites accessible by current user"
)


