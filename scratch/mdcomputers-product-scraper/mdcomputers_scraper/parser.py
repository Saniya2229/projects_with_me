"""HTML parser that extracts Product objects from MDComputers search result pages."""

from __future__ import annotations

import logging
from typing import List

from bs4 import BeautifulSoup, Tag

from mdcomputers_scraper.models import Product

logger = logging.getLogger(__name__)


def parse_search_page(html: str) -> List[Product]:
    """Parse a single page of search results and return a list of Products.

    This is a pure function: no network I/O.  It only transforms HTML → data,
    making it straightforward to unit-test with fixture files.
    """
    soup = BeautifulSoup(html, "lxml")
    cards: List[Tag] = soup.select(".product-layout")

    if not cards:
        logger.debug("No .product-layout elements found on page")
        return []

    products: List[Product] = []

    for card in cards:
        try:
            product = _parse_card(card)
            if product:
                products.append(product)
        except Exception:
            logger.warning("Failed to parse a product card — skipping", exc_info=True)

    return products


def get_total_pages(html: str) -> int:
    """Extract the total number of result pages from the pagination bar.

    Returns 1 when pagination is absent (i.e., all results fit on one page).
    """
    soup = BeautifulSoup(html, "lxml")

    # MDComputers shows "Showing X to Y of Z (P Pages)" in .text-right inside .row
    results_text = soup.select_one(".product-compare + .row .text-right")
    if not results_text:
        results_text = soup.select_one(".col-sm-6.text-right")

    if results_text:
        text = results_text.get_text(strip=True)
        # Pattern: "... (3 Pages)"
        if "Pages)" in text:
            try:
                pages_str = text.split("(")[-1].split("Pages)")[0].strip()
                return int(pages_str)
            except (ValueError, IndexError):
                pass

    # Fallback: count pagination links
    pagination_links = soup.select(".pagination li a")
    if pagination_links:
        page_numbers = []
        for link in pagination_links:
            text = link.get_text(strip=True)
            if text.isdigit():
                page_numbers.append(int(text))
        if page_numbers:
            return max(page_numbers)

    return 1


# ── Private helpers ──────────────────────────────────────────────────────────


def _parse_card(card: Tag) -> Product | None:
    """Extract product data from a single .product-layout card."""

    # ── Name & URL ───────────────────────────────────────────────────────
    name_el = card.select_one(".caption h4 a") or card.select_one(".name a")
    if name_el is None:
        return None

    name = name_el.get_text(strip=True)
    product_url = name_el.get("href", "")

    # ── Price ────────────────────────────────────────────────────────────
    price_el = card.select_one(".price-new") or card.select_one(".price")
    price = _clean_price(price_el) if price_el else "N/A"

    # ── Image ────────────────────────────────────────────────────────────
    img_el = card.select_one("img.img-responsive") or card.select_one("img")
    image_url = img_el.get("src", "") if img_el else ""

    # ── Availability ─────────────────────────────────────────────────────
    stock_el = card.select_one(".stock-status") or card.select_one(".availability")
    availability = stock_el.get_text(strip=True) if stock_el else "N/A"

    return Product(
        name=name,
        price=price,
        product_url=product_url,
        image_url=image_url,
        availability=availability,
    )


def _clean_price(el: Tag) -> str:
    """Return only the main price (ignore old / tax prices)."""
    # .price-new contains the current selling price
    new_price = el if el.name != "div" else el.select_one(".price-new")
    if new_price:
        return new_price.get_text(strip=True)
    # Fallback: first non-empty stripped string
    for text in el.stripped_strings:
        return text
    return "N/A"
