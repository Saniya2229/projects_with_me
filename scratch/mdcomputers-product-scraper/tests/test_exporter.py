"""Tests for CSV and JSON exporters."""

import json
import csv
from pathlib import Path

import pytest

from mdcomputers_scraper.models import Product
from mdcomputers_scraper.exporter import to_csv, to_json


@pytest.fixture
def sample_products():
    return [
        Product(
            name="RTX 4060 Ti",
            price="₹42,999",
            product_url="https://mdcomputers.in/rtx-4060-ti",
            image_url="https://mdcomputers.in/img/rtx4060ti.jpg",
            availability="In Stock",
        ),
        Product(
            name="Ryzen 7 7800X3D",
            price="₹36,500",
            product_url="https://mdcomputers.in/ryzen-7-7800x3d",
            image_url="https://mdcomputers.in/img/7800x3d.jpg",
            availability="Out of Stock",
        ),
    ]


class TestCSVExporter:

    def test_creates_file(self, tmp_path, sample_products):
        output = tmp_path / "test.csv"
        result = to_csv(sample_products, output)
        assert result.exists()
        assert result == output

    def test_correct_row_count(self, tmp_path, sample_products):
        output = tmp_path / "test.csv"
        to_csv(sample_products, output)

        with open(output, encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        assert len(rows) == 2

    def test_headers_match(self, tmp_path, sample_products):
        output = tmp_path / "test.csv"
        to_csv(sample_products, output)

        with open(output, encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            assert set(reader.fieldnames) == {
                "Product Name", "Price", "Availability", "Product URL", "Image URL"
            }

    def test_creates_parent_directories(self, tmp_path, sample_products):
        output = tmp_path / "deep" / "nested" / "dir" / "test.csv"
        to_csv(sample_products, output)
        assert output.exists()


class TestJSONExporter:

    def test_creates_file(self, tmp_path, sample_products):
        output = tmp_path / "test.json"
        result = to_json(sample_products, output)
        assert result.exists()

    def test_valid_json(self, tmp_path, sample_products):
        output = tmp_path / "test.json"
        to_json(sample_products, output)

        data = json.loads(output.read_text(encoding="utf-8"))
        assert isinstance(data, list)
        assert len(data) == 2
        assert data[0]["Product Name"] == "RTX 4060 Ti"

    def test_empty_list(self, tmp_path):
        output = tmp_path / "empty.json"
        to_json([], output)

        data = json.loads(output.read_text(encoding="utf-8"))
        assert data == []
