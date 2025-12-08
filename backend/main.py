from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import logging
import requests
import asyncio

sys.path.append(str(Path(__file__).parent.parent))
from routers.api_router import api_router
from login_routes import router as login_router

load_dotenv()

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

app = FastAPI(title="Site Crawler API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(api_router)
app.include_router(login_router)


@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    return {"message": "OK"}


@app.get("/")
async def root():
    return {"message": "Site Crawler API is running"}


@app.on_event("startup")
async def startup_event():
    """Verify all required services are running"""
    logger.info("Backend started")
    
    # Test external site connectivity
    external_sites = {
        "fo1": "https://fo1.altius.finance",
        "fo2": "https://fo2.altius.finance"
    }
    
    for site_id, site_url in external_sites.items():
        try:
            import time
            start_time = time.time()
            response = requests.get(site_url, timeout=10, verify=False, allow_redirects=True)
            elapsed = time.time() - start_time
            status_code = response.status_code
            logger.info(f"External connectivity test - {site_id}: {status_code} ({elapsed:.2f}s)")
        except requests.exceptions.Timeout:
            logger.warning(f"External site timeout - {site_id}")
        except requests.exceptions.ConnectionError:
            logger.warning(f"External site connection error - {site_id}")
        except Exception as e:
            logger.warning(f"External site error - {site_id}: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

