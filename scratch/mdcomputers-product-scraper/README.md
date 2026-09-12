# 🛒 MDComputers Product Scraper

[![CI](https://github.com/yourname/mdcomputers-product-scraper/actions/workflows/ci.yml/badge.svg)](https://github.com/yourname/mdcomputers-product-scraper/actions)
[![Python 3.9+](https://img.shields.io/badge/python-3.9%2B-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A **production-grade** Python web scraper that extracts product information from [MDComputers.in](https://mdcomputers.in) based on a search keyword.

> **⚠️ Disclaimer:** Before using this scraper, ensure that your usage complies with MDComputers' [Terms of Service](https://mdcomputers.in) and `robots.txt`. Websites can change their HTML structure at any time, which may require updating the selectors.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Keyword Search** | Search products by any keyword |
| 📄 **Auto-Pagination** | Automatically fetches all result pages |
| 🔄 **Retry Logic** | Exponential backoff on transient failures |
| 📊 **CSV & JSON Export** | Save results in either format |
| 🎨 **Rich Terminal UI** | Beautiful colored tables and progress bars |
| ⚡ **CLI Arguments** | Full argument parsing — no interactive prompts |
| 🏗️ **Modular Architecture** | Clean separation of concerns |
| 🧪 **Unit Tests** | Comprehensive test suite with 80%+ coverage |
| 🤖 **CI/CD** | GitHub Actions for linting and testing |

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourname/mdcomputers-product-scraper.git
cd mdcomputers-product-scraper

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# For development (includes testing & linting tools)
pip install -r requirements-dev.txt
```

---

## 🚀 Usage

### Basic Search

```bash
python scraper.py "external harddrive"
```

### Advanced Options

```bash
# Save as JSON instead of CSV
python scraper.py "rtx 4060" --format json -o results.json

# Limit to first 3 pages with 2s delay between requests
python scraper.py "ssd nvme" --max-pages 3 --delay 2.0

# Enable debug logging
python scraper.py "ram ddr5" -v

# Custom timeout and retries
python scraper.py "monitor 27 inch" --timeout 30 --retries 5
```

### Run as a Module

```bash
python -m mdcomputers_scraper "keyboard mechanical"
```

### All CLI Options

```
usage: mdcomputers-scraper [-h] [-o OUTPUT] [--format {csv,json}]
                           [--max-pages MAX_PAGES] [--delay DELAY]
                           [--timeout TIMEOUT] [--retries RETRIES]
                           [-v] [--version]
                           keyword

positional arguments:
  keyword               Search keyword (e.g. 'external harddrive')

options:
  -h, --help            show this help message and exit
  -o, --output OUTPUT   Output file path (default: output/results.csv)
  --format {csv,json}   Output format (default: csv)
  --max-pages N         Maximum number of pages to scrape (default: all)
  --delay DELAY         Delay between page requests in seconds (default: 1.0)
  --timeout TIMEOUT     HTTP request timeout in seconds (default: 20)
  --retries RETRIES     Max retry attempts per request (default: 3)
  -v, --verbose         Enable debug logging
  --version             show program's version number and exit
```

---

## 🏗️ Project Structure

```
mdcomputers-product-scraper/
│
├── mdcomputers_scraper/          # Core package
│   ├── __init__.py               # Package init & public API
│   ├── __main__.py               # python -m support
│   ├── cli.py                    # CLI argument parsing & rich output
│   ├── models.py                 # Product dataclass
│   ├── parser.py                 # HTML parsing (pure functions, no I/O)
│   ├── scraper.py                # HTTP client with retry & pagination
│   └── exporter.py               # CSV & JSON export utilities
│
├── tests/                        # Unit tests
│   ├── test_parser.py            # Parser & model tests
│   └── test_exporter.py          # Exporter tests
│
├── .github/workflows/ci.yml      # GitHub Actions CI
├── scraper.py                    # Convenience entry point
├── requirements.txt              # Production dependencies
├── requirements-dev.txt          # Dev/test dependencies
├── pyproject.toml                # Project & tool configuration
├── .gitignore
└── README.md
```

---

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=mdcomputers_scraper --cov-report=term-missing

# Run a specific test class
pytest tests/test_parser.py::TestParseSearchPage -v
```

---

## 🔧 Development

```bash
# Lint
ruff check mdcomputers_scraper/ tests/

# Auto-fix lint issues
ruff check --fix mdcomputers_scraper/ tests/

# Format code
ruff format mdcomputers_scraper/ tests/
```

---

## 📄 Sample Output

### Terminal

```
╭──────────────────────────────────────────────────────╮
│       MDComputers Product Scraper                    │
│       v1.0.0                                         │
╰──────────────────────────────────────────────────────╯
🔎 Keyword: external harddrive
📁 Output : output/results.csv

      🛒  Found 12 Products
┏━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━━┓
┃  # ┃ Product Name                     ┃      Price ┃ Availability ┃
┡━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━━━━━━┩
│  1 │ WD My Passport 1TB External HDD  │     ₹5,199 │ In Stock     │
│  2 │ Seagate Backup Plus Slim 2TB     │     ₹5,999 │ In Stock     │
│  3 │ Samsung T7 1TB Portable SSD      │     ₹8,499 │ In Stock     │
└────┴────────────────────────────────────┴────────────┴──────────────┘

Completed in 3.42s

✔ Saved 12 products → output/results.csv
```

### CSV Output

| Product Name | Price | Availability | Product URL | Image URL |
|---|---|---|---|---|
| WD My Passport 1TB | ₹5,199 | In Stock | https://mdcomputers.in/... | https://... |

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.
