from fastapi import APIRouter, HTTPException, status, Query
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sys
from pathlib import Path
import logging
import requests
import uuid
from datetime import datetime, timedelta

sys.path.append(str(Path(__file__).parent))
from credentials.services.website_scraper import WebsiteScraper

router = APIRouter()
logger = logging.getLogger(__name__)

SUPPORTED_WEBSITES = {
    "fo1": "https://fo1.altius.finance",
    "fo2": "https://fo2.altius.finance"
}

_session_store: dict[str, WebsiteScraper] = {}
_session_expiry: dict[str, datetime] = {}
SESSION_TIMEOUT = timedelta(hours=1)


class FileInfo(BaseModel):
    id: int
    name: str
    download_url: str


class DealInfo(BaseModel):
    id: int
    name: str
    category: str
    owner: str
    files: List[FileInfo]


class LoginRequest(BaseModel):
    website: str
    username: str
    password: str


class LoginResponse(BaseModel):
    session: str
    session_id: str
    user: Dict[str, Any]
    deals: List[DealInfo]


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    logger.info("Login request received")
    
    website_id = credentials.website.lower().strip()
    
    if website_id not in SUPPORTED_WEBSITES:
        logger.error(f"Invalid website: {website_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Website '{website_id}' is not supported. Supported websites: {', '.join(SUPPORTED_WEBSITES.keys())}"
        )
    
    if not credentials.username or not credentials.password:
        logger.error("Missing login fields")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing login fields"
        )
    
    website_url = SUPPORTED_WEBSITES[website_id]
    
    try:
        scraper = WebsiteScraper()
        
        deals = scraper.get_deals_from_website(
            website_url=website_url,
            username=credentials.username,
            password=credentials.password,
            website_id=website_id
        )
        
        user_data = scraper.get_user_session(website_id)
        if not user_data:
            logger.error("Session verification failed")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session verification failed"
            )
        
        logger.info(f"Login successful - website: {website_id}, deals: {len(deals)}")
        
        session_id = str(uuid.uuid4())
        _session_store[session_id] = scraper
        _session_expiry[session_id] = datetime.now() + SESSION_TIMEOUT
        
        deal_responses = []
        for deal in deals:
            file_responses = [
                FileInfo(
                    id=file.get("id", 0),
                    name=file.get("name", ""),
                    download_url=file.get("download_url", "")
                )
                for file in deal.get("files", [])
            ]
            
            deal_responses.append(
                DealInfo(
                    id=deal.get("id", 0),
                    name=deal.get("name", ""),
                    category=deal.get("category", ""),
                    owner=deal.get("owner", ""),
                    files=file_responses
                )
            )
        
        return LoginResponse(
            session="active",
            session_id=session_id,
            user=user_data,
            deals=deal_responses
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error_message = str(e).lower()
        logger.error(f"Login failed - error: {error_message}")
        
        if "bad credentials" in error_message or "401" in error_message:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Bad credentials"
            )
        elif "website unavailable" in error_message or "502" in error_message or "503" in error_message or "504" in error_message:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Website unavailable"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unexpected error"
            )


@router.get("/download")
async def download_file(
    url: str = Query(..., description="File download URL"),
    session_id: Optional[str] = Query(None, description="Session ID for authenticated downloads")
):
    logger.info(f"File download started - url: {url}")
    
    if not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Download URL is required"
        )
    
    if not url.startswith('http://') and not url.startswith('https://'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid download URL"
        )
    
    try:
        now = datetime.now()
        expired_sessions = [sid for sid, expiry in _session_expiry.items() if expiry < now]
        for sid in expired_sessions:
            _session_store.pop(sid, None)
            _session_expiry.pop(sid, None)
        
        if session_id and session_id in _session_store:
            scraper = _session_store[session_id]
            response = scraper.session.get(
                url,
                timeout=(10, 60),
                verify=False,
                stream=True
            )
        else:
            session = requests.Session()
            session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            })
            response = session.get(
                url,
                timeout=(10, 60),
                verify=False,
                stream=True
            )
        
        if response.status_code == 401 or response.status_code == 403:
            logger.error(f"File download unauthorized - status: {response.status_code}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized"
            )
        
        response.raise_for_status()
        
        filename = "download"
        if 'Content-Disposition' in response.headers:
            import re
            match = re.search(r'filename="?([^"]+)"?', response.headers['Content-Disposition'])
            if match:
                filename = match.group(1)
        else:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            path_parts = parsed.path.split('/')
            if path_parts:
                potential_filename = path_parts[-1]
                if potential_filename and '.' in potential_filename:
                    filename = potential_filename
        
        logger.info(f"File download successful - filename: {filename}")
        
        return StreamingResponse(
            response.iter_content(chunk_size=8192),
            media_type=response.headers.get('Content-Type', 'application/octet-stream'),
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
        
    except HTTPException:
        raise
    except requests.exceptions.RequestException as e:
        error_message = str(e).lower()
        logger.error(f"File download failed - error: {error_message}")
        
        if "401" in error_message or "403" in error_message or "unauthorized" in error_message:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized"
            )
        elif "timeout" in error_message or "504" in error_message:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Request timeout"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to download file"
            )
    except Exception as e:
        logger.error(f"File download error - error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error"
        )


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "login_routes",
        "endpoints": {
            "login": "/login",
            "download": "/download?url=..."
        }
    }
