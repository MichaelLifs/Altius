"""
User router - defines API endpoints
"""
from fastapi import APIRouter
import sys
from pathlib import Path

# Add parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))
sys.path.append(str(Path(__file__).parent.parent.parent.parent))
from users.controllers.user_controller import UserController
from users.schemas.user_schemas import (
    LoginRequest,
    LoginResponse,
    UserCreate,
    UserUpdate,
    UserListResponse,
    UserDetailResponse
)

# Create router
router = APIRouter(prefix="/users", tags=["Users"])

# Initialize controller
controller = UserController()

# Define routes
router.add_api_route(
    "/login",
    controller.login,
    methods=["POST"],
    response_model=LoginResponse,
    summary="Login user"
)

router.add_api_route(
    "",
    controller.get_all_users,
    methods=["GET"],
    response_model=UserListResponse,
    summary="Get all users"
)

router.add_api_route(
    "/{user_id}",
    controller.get_user_by_id,
    methods=["GET"],
    response_model=UserDetailResponse,
    summary="Get user by ID"
)

router.add_api_route(
    "",
    controller.create_user,
    methods=["POST"],
    response_model=UserDetailResponse,
    status_code=201,
    summary="Create new user"
)

router.add_api_route(
    "/{user_id}",
    controller.update_user,
    methods=["PUT"],
    response_model=UserDetailResponse,
    summary="Update user"
)

router.add_api_route(
    "/{user_id}",
    controller.delete_user,
    methods=["DELETE"],
    response_model=UserDetailResponse,
    summary="Delete user (soft delete)"
)

router.add_api_route(
    "/role/{role}",
    controller.get_users_by_role,
    methods=["GET"],
    response_model=UserListResponse,
    summary="Get users by role"
)

