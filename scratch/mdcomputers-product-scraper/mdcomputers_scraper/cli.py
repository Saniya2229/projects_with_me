"""Command-line interface with rich terminal output and argument parsing."""

from __future__ import annotations

import argparse
import logging
import sys
import time
from pathlib import Path

from rich.console import Console
from rich.logging import RichHandler
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn

from mdcomputers_scraper import __version__
from mdcomputers_scraper.scraper import MDComputersScraper, ScraperError
from mdcomputers_scraper.exporter import to_csv, to_json

console = Console()


def _setup_logging(verbose: bool) -> None:
    """Configure structured logging with Rich formatting."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(message)s",
        datefmt="[%X]",
        handlers=[RichHandler(console=console, rich_tracebacks=True, show_path=False)],
    )


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="mdcomputers-scraper",
        description="🔍 Scrape product listings from MDComputers.in",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python -m mdcomputers_scraper \"rtx 4060\"\n"
            "  python -m mdcomputers_scraper \"ram ddr5\" -o results.csv --format csv\n"
            "  python -m mdcomputers_scraper \"ssd nvme\" --max-pages 3 --delay 2.0\n"
        ),
    )
    parser.add_argument("keyword", help="Search keyword (e.g. 'external harddrive')")
    parser.add_argument(
        "-o", "--output",
        default="output/results.csv",
        help="Output file path (default: output/results.csv)",
    )
    parser.add_argument(
        "--format",
        choices=["csv", "json"],
        default="csv",
        help="Output format (default: csv)",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=None,
        help="Maximum number of pages to scrape (default: all)",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=1.0,
        help="Delay between page requests in seconds (default: 1.0)",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=20,
        help="HTTP request timeout in seconds (default: 20)",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=3,
        help="Max retry attempts per request (default: 3)",
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable debug logging",
    )
    parser.add_argument(
        "--version",
        action="version",
        version=f"%(prog)s {__version__}",
    )
    return parser


def _display_results(products, elapsed: float) -> None:
    """Render a rich table of results to the terminal."""
    if not products:
        console.print("\n[yellow]⚠  No products found.[/yellow]\n")
        return

    table = Table(
        title=f"🛒  Found {len(products)} Products",
        title_style="bold cyan",
        show_lines=True,
        border_style="bright_blue",
        header_style="bold magenta",
        row_styles=["", "dim"],
    )
    table.add_column("#", style="bold white", width=4, justify="right")
    table.add_column("Product Name", style="green", max_width=55)
    table.add_column("Price", style="bold yellow", width=14, justify="right")
    table.add_column("Availability", style="cyan", width=16)

    for i, p in enumerate(products, 1):
        table.add_row(str(i), p.name, p.price, p.availability)

    console.print()
    console.print(table)
    console.print(f"\n[dim]Completed in {elapsed:.2f}s[/dim]\n")


def main(argv: list[str] | None = None) -> int:
    """Entry point for the CLI."""
    parser = _build_parser()
    args = parser.parse_args(argv)

    _setup_logging(args.verbose)

    # ── Banner ───────────────────────────────────────────────────────────
    console.print(
        Panel.fit(
            "[bold cyan]MDComputers Product Scraper[/bold cyan]\n"
            f"[dim]v{__version__} • github.com/yourname/mdcomputers-product-scraper[/dim]",
            border_style="bright_blue",
            padding=(1, 4),
        )
    )
    console.print(f"[bold]🔎 Keyword:[/bold] [green]{args.keyword}[/green]")
    console.print(f"[bold]📁 Output :[/bold] [blue]{args.output}[/blue]")
    console.print()

    # ── Scrape ───────────────────────────────────────────────────────────
    start = time.perf_counter()

    try:
        with MDComputersScraper(
            delay=args.delay,
            timeout=args.timeout,
            max_retries=args.retries,
            max_pages=args.max_pages,
        ) as scraper:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                TaskProgressColumn(),
                console=console,
                transient=True,
            ) as progress:
                task = progress.add_task("Scraping products...", total=None)
                products = scraper.search(args.keyword)
                progress.update(task, completed=100, total=100)

    except ScraperError as exc:
        console.print(f"\n[bold red]✖ Error:[/bold red] {exc}\n")
        return 1
    except KeyboardInterrupt:
        console.print("\n[yellow]⚠  Interrupted by user[/yellow]\n")
        return 130

    elapsed = time.perf_counter() - start

    # ── Display ──────────────────────────────────────────────────────────
    _display_results(products, elapsed)

    # ── Export ───────────────────────────────────────────────────────────
    if products:
        output_path = Path(args.output)
        if args.format == "json" or output_path.suffix == ".json":
            saved = to_json(products, output_path)
        else:
            saved = to_csv(products, output_path)
        console.print(f"[bold green]✔ Saved {len(products)} products → {saved}[/bold green]\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
