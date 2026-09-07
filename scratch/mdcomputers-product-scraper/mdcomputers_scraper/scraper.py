"""Core scraper with session management, pagination, and retry logic."""

from __future__ import annotations

import logging
import time
from typing import List, Optional
from urllib.parse import quote, urlencode

import requests
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)

from mdcomputers_scraper.models import Product
from mdcomputers_scraper.parser import parse_search_page, get_total_pages

logger = logging.getLogger(__name__)

DEFAULT_BASE_URL = "https://mdcomputers.in/"

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/138.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# Retry configuration defaults
_MAX_RETRIES = 3
_RETRY_MIN_WAIT = 2   # seconds
_RETRY_MAX_WAIT = 30  # seconds


class ScraperError(Exception):
    """Raised when a scrape operation fails irrecoverably."""


class MDComputersScraper:
    """Production-grade MDComputers product scraper.

    Features
    --------
    * Persistent ``requests.Session`` for connection pooling.
    * Automatic pagination — fetches every results page.
    * Exponential-backoff retries on transient HTTP errors.
    * Configurable request delay to respect rate limits.
    * Clean separation of I/O (this class) and parsing (``parser`` module).
    """

    def __init__(
        self,
        *,
        base_url: str = DEFAULT_BASE_URL,
        headers: Optional[dict] = None,
        timeout: int = 20,
        delay: float = 1.0,
        max_retries: int = _MAX_RETRIES,
        max_pages: Optional[int] = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.delay = delay
        self.max_retries = max_retries
        self.max_pages = max_pages

        self._session = requests.Session()
        self._session.headers.update(headers or DEFAULT_HEADERS)

    # ── Public API ───────────────────────────────────────────────────────

    def search(self, keyword: str) -> List[Product]:
        """Search for *keyword* and return **all** matching products across pages.

        Parameters
        ----------
        keyword : str
            The search term (e.g. ``"rtx 4060"``).

        Returns
        -------
        list[Product]
            De-duplicated list of products found.
        """
        logger.info("Searching for '%s' ...", keyword)

        first_page_html = self._fetch_page(keyword, page=1)
        total_pages = get_total_pages(first_page_html)

        if self.max_pages:
            total_pages = min(total_pages, self.max_pages)

        logger.info("Total result pages: %d", total_pages)

        all_products: List[Product] = parse_search_page(first_page_html)

        for page_num in range(2, total_pages + 1):
            time.sleep(self.delay)  # polite crawling
            logger.info("Fetching page %d / %d ...", page_num, total_pages)
            html = self._fetch_page(keyword, page=page_num)
            all_products.extend(parse_search_page(html))

        # De-duplicate by product URL (preserves order)
        seen = set()
        unique: List[Product] = []
        for p in all_products:
            if p.product_url not in seen:
                seen.add(p.product_url)
                unique.append(p)

        logger.info("Total unique products found: %d", len(unique))
        return unique

    def close(self) -> None:
        """Close the underlying HTTP session."""
        self._session.close()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()

    # ── Private helpers ──────────────────────────────────────────────────

    def _build_url(self, keyword: str, page: int) -> str:
        """Construct the search URL for a given page."""
        params = {
            "route": "product/search",
            "search": keyword,
        }
        if page > 1:
            params["page"] = str(page)
        return f"{self.base_url}/?{urlencode(params)}"

    def _fetch_page(self, keyword: str, page: int) -> str:
        """Fetch a single search-results page with retry logic.

        Uses ``tenacity`` for exponential backoff on transient failures.
        """
        url = self._build_url(keyword, page)
        logger.debug("GET %s", url)

        @retry(
            stop=stop_after_attempt(self.max_retries),
            wait=wait_exponential(min=_RETRY_MIN_WAIT, max=_RETRY_MAX_WAIT),
            retry=retry_if_exception_type(
                (requests.ConnectionError, requests.Timeout, requests.HTTPError)
            ),
            before_sleep=before_sleep_log(logger, logging.WARNING),
            reraise=True,
        )
        def _do_request() -> str:
            resp = self._session.get(url, timeout=self.timeout)
            resp.raise_for_status()
            return resp.text

        try:
            return _do_request()
        except requests.RequestException as exc:
            raise ScraperError(f"Failed to fetch {url} after {self.max_retries} attempts") from exc
