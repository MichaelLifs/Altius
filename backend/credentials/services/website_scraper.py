import requests
from typing import List, Dict, Optional
from requests.adapters import HTTPAdapter
import logging
import time
from urllib.parse import urljoin
try:
    from requests.packages.urllib3.util.retry import Retry
except ImportError:
    from urllib3.util.retry import Retry

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)


class WebsiteScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        })
        
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

    def get_api_base_url(self, website_id: str) -> str:
        return f"https://{website_id}.api.altius.finance/api/v0.0.2"

    def get_deals_from_website(
        self,
        website_url: str,
        username: str,
        password: str,
        website_id: str
    ) -> List[Dict]:
        logger.info(f"Login request received - website: {website_id}")
        
        api_base = self.get_api_base_url(website_id)
        ui_base = f"https://{website_id}.altius.finance"
        
        self.session.headers['Origin'] = ui_base
        self.session.headers['Referer'] = f"{ui_base}/login"
        
        login_success = self._authenticate(api_base, username, password, website_id)
        if not login_success:
            logger.error(f"Login failed - website: {website_id}")
            raise Exception("Bad credentials")
        
        logger.info(f"Login successful - website: {website_id}")
        
        session_valid = self._verify_session(api_base, website_id)
        if not session_valid:
            logger.error(f"Session verification failed - website: {website_id}")
            raise Exception("Session verification failed")
        
        logger.info(f"Session verified - website: {website_id}")
        
        try:
            deals = self._fetch_deals(api_base, website_id)
            logger.info(f"Deals fetched - website: {website_id}, count: {len(deals)}")
            return deals
        except Exception as e:
            logger.warning(f"Deals fetch failed - website: {website_id}, error: {str(e)}")
            return []

    def _authenticate(
        self,
        api_base: str,
        username: str,
        password: str,
        website_id: str
    ) -> bool:
        login_url = f"{api_base}/login"
        
        payload = {
            "email": username,
            "password": password
        }
        
        try:
            response = self.session.post(
                login_url,
                json=payload,
                timeout=(10, 30),
                verify=False,
                allow_redirects=True
            )
            
            logger.debug(f"Login response status: {response.status_code}, URL: {response.url}")
            
            if response.status_code == 401:
                logger.error(f"Authentication failed - status: 401")
                try:
                    error_body = response.text[:200]
                    logger.error(f"Error response: {error_body}")
                except:
                    pass
                return False
            
            if response.status_code == 200:
                logger.info(f"Authentication successful - status: 200, cookies: {len(self.session.cookies)}")
                return True
            
            logger.error(f"Authentication failed - status: {response.status_code}")
            try:
                error_body = response.text[:200]
                logger.error(f"Error response: {error_body}")
            except:
                pass
            return False
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Authentication request failed - error: {str(e)}, type: {type(e).__name__}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise Exception("Website unavailable")

    def _verify_session(self, api_base: str, website_id: str) -> bool:
        session_url = f"{api_base}/users/session"
        
        try:
            response = self.session.get(
                session_url,
                timeout=(10, 30),
                verify=False,
                allow_redirects=True
            )
            
            if response.status_code == 401:
                logger.error(f"Session verification failed - status: 401")
                return False
            
            if response.status_code == 200:
                logger.info(f"Session verified - status: 200")
                return True
            
            logger.error(f"Session verification failed - status: {response.status_code}")
            return False
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Session verification request failed - error: {str(e)}")
            raise Exception("Website unavailable")

    def _fetch_deals(self, api_base: str, website_id: str) -> List[Dict]:
        deals = []
        
        deals_list_url = f"{api_base}/deals-list"
        try:
            response = self.session.post(
                deals_list_url,
                json={},
                timeout=(10, 30),
                verify=False,
                allow_redirects=True
            )
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        deals.extend(self._normalize_deals(data))
                    elif isinstance(data, dict):
                        if 'deals' in data:
                            deals.extend(self._normalize_deals(data['deals'] if isinstance(data['deals'], list) else [data['deals']]))
                        elif 'data' in data:
                            if isinstance(data['data'], list):
                                deals.extend(self._normalize_deals(data['data']))
                            elif isinstance(data['data'], dict) and 'deals' in data['data']:
                                deals.extend(self._normalize_deals(data['data']['deals'] if isinstance(data['data']['deals'], list) else [data['data']['deals']]))
                        else:
                            deals.extend(self._normalize_deals([data]))
                except Exception as e:
                    logger.warning(f"Failed to parse deals-list response - error: {str(e)}")
        except requests.exceptions.RequestException as e:
            logger.warning(f"deals-list request failed - error: {str(e)}")
        
        deals_cards_url = f"{api_base}/deals-cards"
        try:
            response = self.session.post(
                deals_cards_url,
                json={},
                timeout=(10, 30),
                verify=False,
                allow_redirects=True
            )
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        deals.extend(self._normalize_deals(data))
                    elif isinstance(data, dict):
                        if 'deals' in data:
                            deals.extend(self._normalize_deals(data['deals'] if isinstance(data['deals'], list) else [data['deals']]))
                        elif 'data' in data:
                            if isinstance(data['data'], list):
                                deals.extend(self._normalize_deals(data['data']))
                            elif isinstance(data['data'], dict) and 'deals' in data['data']:
                                deals.extend(self._normalize_deals(data['data']['deals'] if isinstance(data['data']['deals'], list) else [data['data']['deals']]))
                        else:
                            deals.extend(self._normalize_deals([data]))
                except Exception as e:
                    logger.warning(f"Failed to parse deals-cards response - error: {str(e)}")
        except requests.exceptions.RequestException as e:
            logger.warning(f"deals-cards request failed - error: {str(e)}")
        
        seen_ids = set()
        unique_deals = []
        for deal in deals:
            deal_id = deal.get("id", 0)
            if deal_id and deal_id not in seen_ids:
                seen_ids.add(deal_id)
                unique_deals.append(deal)
            elif not deal_id:
                unique_deals.append(deal)
        
        return unique_deals

    def _normalize_deals(self, deals_data: List) -> List[Dict]:
        normalized = []
        
        for deal in deals_data:
            if not isinstance(deal, dict):
                continue
            
            normalized_deal = {
                "id": deal.get("id") or deal.get("deal_id") or deal.get("_id") or 0,
                "name": deal.get("name") or deal.get("title") or deal.get("deal_name") or deal.get("dealName") or "",
                "category": deal.get("category") or deal.get("type") or deal.get("deal_type") or deal.get("assetClass") or "",
                "owner": deal.get("owner") or deal.get("user") or deal.get("username") or deal.get("created_by") or deal.get("createdBy") or "",
                "files": []
            }
            
            files = deal.get("files") or deal.get("attachments") or deal.get("documents") or deal.get("fileAttachments") or []
            if isinstance(files, list):
                for file_item in files:
                    if isinstance(file_item, dict):
                        normalized_file = {
                            "id": file_item.get("id") or file_item.get("file_id") or file_item.get("_id") or 0,
                            "name": file_item.get("name") or file_item.get("filename") or file_item.get("file_name") or file_item.get("fileName") or "",
                            "download_url": file_item.get("download_url") or file_item.get("url") or file_item.get("file_url") or file_item.get("fileUrl") or file_item.get("downloadUrl") or ""
                        }
                        if normalized_file["id"] or normalized_file["name"] or normalized_file["download_url"]:
                            normalized_deal["files"].append(normalized_file)
            
            normalized.append(normalized_deal)
        
        return normalized

    def get_user_session(self, website_id: str) -> Optional[Dict]:
        api_base = self.get_api_base_url(website_id)
        session_url = f"{api_base}/users/session"
        
        try:
            response = self.session.get(
                session_url,
                timeout=(10, 30),
                verify=False,
                allow_redirects=True
            )
            
            if response.status_code == 200:
                return response.json()
            return None
        except requests.exceptions.RequestException:
            return None

    def download_file(
        self,
        website_url: str,
        file_id: str,
        download_url: Optional[str] = None
    ) -> bytes:
        if not download_url:
            raise Exception("Download URL is required")
        
        if not download_url.startswith('http'):
            raise Exception("Download URL must be absolute")
        
        try:
            response = self.session.get(
                download_url,
                timeout=(10, 60),
                verify=False,
                stream=True
            )
            response.raise_for_status()
            logger.info(f"File download started - url: {download_url}")
            return response.content
        except requests.exceptions.RequestException as e:
            logger.error(f"File download failed - url: {download_url}, error: {str(e)}")
            raise Exception(f"Failed to download file: {str(e)}")
