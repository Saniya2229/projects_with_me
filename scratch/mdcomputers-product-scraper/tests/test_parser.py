"""Unit tests for the HTML parser — no network I/O required."""

import pytest

from mdcomputers_scraper.parser import parse_search_page, get_total_pages
from mdcomputers_scraper.models import Product


# ── Fixtures ─────────────────────────────────────────────────────────────────

SINGLE_PRODUCT_HTML = """
<html>
<body>
<div class="product-layout">
  <div class="image">
    <a href="https://mdcomputers.in/wd-my-passport-1tb">
      <img class="img-responsive" src="https://mdcomputers.in/image/wd-passport.jpg" />
    </a>
  </div>
  <div class="caption">
    <h4><a href="https://mdcomputers.in/wd-my-passport-1tb">WD My Passport 1TB External Hard Drive</a></h4>
  </div>
  <div class="price">
    <span class="price-new">₹5,199</span>
    <span class="price-old">₹6,499</span>
  </div>
  <div class="stock-status">In Stock</div>
</div>
</body>
</html>
"""

MULTIPLE_PRODUCTS_HTML = """
<html>
<body>
<div class="product-layout">
  <div class="caption"><h4><a href="https://mdcomputers.in/product-1">Product One</a></h4></div>
  <div class="price"><span class="price-new">₹1,000</span></div>
</div>
<div class="product-layout">
  <div class="caption"><h4><a href="https://mdcomputers.in/product-2">Product Two</a></h4></div>
  <div class="price"><span class="price-new">₹2,000</span></div>
</div>
<div class="product-layout">
  <div class="caption"><h4><a href="https://mdcomputers.in/product-3">Product Three</a></h4></div>
  <div class="price"><span class="price-new">₹3,500</span></div>
</div>
</body>
</html>
"""

EMPTY_RESULTS_HTML = """
<html>
<body>
<div class="content">
  <p>There is no product that matches the search criteria.</p>
</div>
</body>
</html>
"""

MALFORMED_CARD_HTML = """
<html>
<body>
<div class="product-layout">
  <!-- Missing caption and name elements entirely -->
  <div class="price">₹999</div>
</div>
<div class="product-layout">
  <div class="caption"><h4><a href="https://mdcomputers.in/good-product">Good Product</a></h4></div>
  <div class="price"><span class="price-new">₹4,999</span></div>
</div>
</body>
</html>
"""

PAGINATION_HTML = """
<html>
<body>
<div class="product-compare"></div>
<div class="row">
  <div class="col-sm-6 text-right">Showing 1 to 15 of 42 (3 Pages)</div>
</div>
</body>
</html>
"""

PAGINATION_LINKS_HTML = """
<html>
<body>
<ul class="pagination">
  <li><a href="?page=1">1</a></li>
  <li><a href="?page=2">2</a></li>
  <li><a href="?page=3">3</a></li>
  <li><a href="?page=4">4</a></li>
  <li><a href="?page=5">5</a></li>
  <li><a href="?page=2">&gt;</a></li>
</ul>
</body>
</html>
"""


# ── parse_search_page tests ─────────────────────────────────────────────────


class TestParseSearchPage:
    """Tests for parse_search_page()."""

    def test_single_product(self):
        products = parse_search_page(SINGLE_PRODUCT_HTML)
        assert len(products) == 1

        p = products[0]
        assert isinstance(p, Product)
        assert p.name == "WD My Passport 1TB External Hard Drive"
        assert p.price == "₹5,199"
        assert p.product_url == "https://mdcomputers.in/wd-my-passport-1tb"
        assert p.image_url == "https://mdcomputers.in/image/wd-passport.jpg"
        assert p.availability == "In Stock"

    def test_multiple_products(self):
        products = parse_search_page(MULTIPLE_PRODUCTS_HTML)
        assert len(products) == 3
        assert products[0].name == "Product One"
        assert products[1].name == "Product Two"
        assert products[2].name == "Product Three"

    def test_empty_results(self):
        products = parse_search_page(EMPTY_RESULTS_HTML)
        assert products == []

    def test_malformed_card_skipped_gracefully(self):
        """Cards missing required elements should be skipped, not crash."""
        products = parse_search_page(MALFORMED_CARD_HTML)
        # Only the valid card should be returned
        assert len(products) == 1
        assert products[0].name == "Good Product"

    def test_product_is_immutable(self):
        products = parse_search_page(SINGLE_PRODUCT_HTML)
        with pytest.raises(AttributeError):
            products[0].name = "Modified"

    def test_to_dict(self):
        products = parse_search_page(SINGLE_PRODUCT_HTML)
        d = products[0].to_dict()
        assert d["Product Name"] == "WD My Passport 1TB External Hard Drive"
        assert d["Price"] == "₹5,199"
        assert "Product URL" in d
        assert "Image URL" in d


# ── get_total_pages tests ───────────────────────────────────────────────────


class TestGetTotalPages:
    """Tests for get_total_pages()."""

    def test_extracts_from_text(self):
        assert get_total_pages(PAGINATION_HTML) == 3

    def test_extracts_from_links(self):
        assert get_total_pages(PAGINATION_LINKS_HTML) == 5

    def test_returns_1_when_no_pagination(self):
        assert get_total_pages(EMPTY_RESULTS_HTML) == 1

    def test_returns_1_for_single_page_results(self):
        assert get_total_pages(SINGLE_PRODUCT_HTML) == 1


# ── Product model tests ─────────────────────────────────────────────────────


class TestProductModel:
    """Tests for the Product dataclass."""

    def test_str_representation(self):
        p = Product(
            name="Test GPU",
            price="₹50,000",
            product_url="https://example.com",
            image_url="https://example.com/img.jpg",
        )
        assert str(p) == "Test GPU — ₹50,000"

    def test_equality(self):
        p1 = Product(name="A", price="₹1", product_url="u", image_url="i")
        p2 = Product(name="A", price="₹1", product_url="u", image_url="i")
        assert p1 == p2

    def test_hash_support(self):
        """Frozen dataclasses should be hashable (usable in sets)."""
        p = Product(name="A", price="₹1", product_url="u", image_url="i")
        s = {p}
        assert p in s
