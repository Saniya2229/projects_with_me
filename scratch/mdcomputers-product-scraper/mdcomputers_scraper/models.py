"""Data models for scraped products."""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Optional


@dataclass(frozen=True)
class Product:
    """Immutable representation of a single product listing."""

    name: str
    price: str
    product_url: str
    image_url: str
    availability: str = "N/A"

    def to_dict(self) -> dict:
        """Serialize to a flat dictionary suitable for CSV / JSON export."""
        return {
            "Product Name": self.name,
            "Price": self.price,
            "Availability": self.availability,
            "Product URL": self.product_url,
            "Image URL": self.image_url,
        }

    def __str__(self) -> str:
        return f"{self.name} — {self.price}"
