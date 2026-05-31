#!/usr/bin/env python3
"""Convert PDF and EPUB books to Markdown."""

import sys
from pathlib import Path

# --- PDF conversion ---
from pypdf import PdfReader


def pdf_to_md(pdf_path: Path, md_path: Path) -> None:
    reader = PdfReader(str(pdf_path))
    total = len(reader.pages)
    lines = [f"# {pdf_path.stem}\n", f"**Total pages:** {total}\n"]
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text()
        if not text:
            continue
        lines.append(f"\n---\n\n## Page {i}\n")
        lines.append(text)
        lines.append("\n")
    md_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[PDF] Wrote {md_path} ({total} pages)")


# --- EPUB conversion ---
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
from markdownify import markdownify as md


def epub_to_md(epub_path: Path, md_path: Path) -> None:
    book = epub.read_epub(str(epub_path))
    lines = [f"# {epub_path.stem}\n"]
    item_count = 0
    for item in book.get_items():
        if item.get_type() != ebooklib.ITEM_DOCUMENT:
            continue
        item_count += 1
        html = item.get_content().decode("utf-8", errors="ignore")
        soup = BeautifulSoup(html, "lxml")
        # Remove scripts/styles
        for tag in soup(["script", "style"]):
            tag.decompose()
        # Convert to markdown
        markdown_text = md(str(soup), heading_style="ATX")
        lines.append(f"\n---\n\n{markdown_text}\n")
    md_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[EPUB] Wrote {md_path} ({item_count} document items)")


if __name__ == "__main__":
    base = Path("/home/eric-lepore/projects/Studies/knowledge")
    out = Path("/home/eric-lepore/projects/Studies/knowledge")

    pdf_file = base / (
        "Agile Testing_ A Practical Guide for Testers and Agile Teams -- Crispin, "
        "Lisa;Gregory, Janet -- The Addison-Wesley signature series; A Mike Cohn -- "
        "isbn13 9780134190624 -- 9010e09b01e264dd38373e4d714dcded -- Anna’s Archive.pdf"
    )
    epub_file = base / (
        "More Agile Testing_ Learning Journeys for the Whole Team -- Crispin, "
        "Lisa;Gregory, Janet -- The Addison-Wesley signature series, 2015 -- Pearson -- "
        "isbn13 9780133749557 -- 57ba6d9a8716787f83db4ea1ee1948ee -- Anna’s Archiv.epub"
    )

    if pdf_file.exists():
        pdf_to_md(pdf_file, out / "agile-testing.md")
    else:
        print(f"PDF not found: {pdf_file}")

    if epub_file.exists():
        epub_to_md(epub_file, out / "more-agile-testing.md")
    else:
        print(f"EPUB not found: {epub_file}")
