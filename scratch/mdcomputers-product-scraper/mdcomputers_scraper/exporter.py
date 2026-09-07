"""CSV and JSON export utilities."""

from __future__ import annotations

import csv
import json
import logging
from pathlib import Path
from typing import List

import pandas as pd

from mdcomputers_scraper.models import Product

logger = logging.getLogger(__name__)


def to_csv(products: List[Product], filepath: str | Path) -> Path:
    """Write products to a CSV file and return the resolved Path."""
    filepath = Path(filepath)
    filepath.parent.mkdir(parents=True, exist_ok=True)

    df = pd.DataFrame([p.to_dict() for p in products])
    df.to_csv(filepath, index=False, encoding="utf-8-sig")  # BOM for Excel compat

    logger.info("Saved %d products → %s", len(df), filepath)
    return filepath


def to_json(products: List[Product], filepath: str | Path) -> Path:
    """Write products to a pretty-printed JSON file."""
    filepath = Path(filepath)
    filepath.parent.mkdir(parents=True, exist_ok=True)

    data = [p.to_dict() for p in products]
    filepath.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    logger.info("Saved %d products → %s", len(data), filepath)
    return filepath
