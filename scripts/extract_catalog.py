"""Extract catalog product records and printable product images from the Whatshome PDF.

Run from the project root with: python scripts/extract_catalog.py
Requires PyMuPDF (pip install pymupdf) and Pillow.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

try:
    import pymupdf as fitz
    from PIL import Image
except ImportError as exc:
    raise SystemExit(
        f"Missing extraction dependency: {exc.name}. Install PyMuPDF and Pillow first."
    ) from exc


ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = ROOT / "docs" / "CatalogoWhatsHome.pdf"
IMAGE_DIR = ROOT / "public" / "images" / "catalog"
JSON_PATH = ROOT / "src" / "data" / "catalog-extraction.json"
TS_PATH = ROOT / "src" / "data" / "products.ts"

CATEGORY_PATTERNS = [
    ("Mesa", re.compile(r"\bMESA\b", re.I)),
    ("Café y Té", re.compile(r"CAF[EÉ]\s*(?:Y|&)\s*T[EÉ]", re.I)),
    ("Kids", re.compile(r"\bKIDS?\b", re.I)),
    ("Baterías", re.compile(r"BATER[IÍ]AS?", re.I)),
    ("Cocina", re.compile(r"\bCOCINA\b", re.I)),
    ("Hogar", re.compile(r"\bHOGAR\b", re.I)),
]
MODEL_RE = re.compile(r"\bmod\.?\s*([A-Z0-9][A-Z0-9./_-]{2,})", re.I)
PRICE_RE = re.compile(r"\$\s*([\d,]+(?:\.\d{1,2})?)")
PIECES_RE = re.compile(r"\b(\d{1,3})\s*(?:pzas?\.?|piezas?)\b", re.I)
CAPACITY_RE = re.compile(
    r"\b\d+(?:[.,]\d+)?\s*(?:ml|l|lt|lts|g|kg|cm|mm|m|oz|in|pulg(?:adas?)?)\b",
    re.I,
)
MEASUREMENT_RE = re.compile(
    r"\b\d+(?:[.,]\d+)?(?:\s*[x×]\s*\d+(?:[.,]\d+)?){1,3}\s*(?:cm|mm|m)\b",
    re.I,
)
ATTRIBUTES = [
    "Libre de BPA",
    "Apto inducción",
    "Filo de oro real",
    "Acero inoxidable",
    "Doble pared",
    "Apto lavavajillas",
    "Apto microondas",
    "Vidrio borosilicato",
    "Antiadherente",
    "Set de regalo",
]
ATTRIBUTE_PATTERNS = [(label, re.compile(re.escape(label), re.I)) for label in ATTRIBUTES]


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip(" \t\r\n•|-")


def normalized_tab_line(value: str) -> str:
    # Some catalog fonts map accented glyphs to U+FFFD in the PDF text layer.
    line = clean(value).upper()
    if line.startswith("BATER") and "�" in line:
        return "BATERIAS"
    return line.replace("�", "E")


def category_for_line(value: str) -> str | None:
    line = normalized_tab_line(value)
    if re.fullmatch(r"CAF[EÉ]\s*(?:Y|&)\s*T[EÉ]", line):
        return "Café y Té"
    if re.fullmatch(r"BATER[IÍ]AS?", line):
        return "Baterías"
    for category, pattern in CATEGORY_PATTERNS:
        if re.fullmatch(pattern.pattern, line, re.I):
            return category
    return None


def detect_category(text: str, previous: str) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    for index, line in enumerate(lines):
        normalized = normalized_tab_line(line)
        tab_count = sum(
            1
            for pattern in (
                re.compile(r"\bMESA\b"),
                re.compile(r"CAF[EÉ]\s*(?:Y|&)\s*T[EÉ]"),
                re.compile(r"\bKIDS?\b"),
                re.compile(r"\bCOCINA\b"),
                re.compile(r"BATER[IÍ]AS?"),
                re.compile(r"\bHOGAR\b"),
            )
            if pattern.search(normalized)
        )
        if tab_count >= 4:
            for candidate in lines[index + 1 : index + 5]:
                category = category_for_line(candidate)
                if category:
                    return category
    return previous


def rgb_pixmap(doc: fitz.Document, xref: int, smask_xref: int = 0) -> Image.Image | None:
    pix = fitz.Pixmap(doc, xref)
    if pix.width < 220 or pix.height < 220 or pix.n == 1:
        return None
    if pix.n > 4 or (pix.colorspace is not None and pix.colorspace.n == 4):
        pix = fitz.Pixmap(fitz.csRGB, pix)
    if pix.n == 2:
        pix = fitz.Pixmap(fitz.csRGB, pix)
    if smask_xref:
        mask = fitz.Pixmap(doc, smask_xref)
        if mask.n != 1:
            mask = fitz.Pixmap(fitz.csGRAY, mask)
        pix = fitz.Pixmap(pix, mask)
    mode = "RGBA" if pix.alpha else "RGB"
    image = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
    if mode == "RGBA":
        alpha_histogram = image.getchannel("A").histogram()
        visible = sum(alpha_histogram[16:]) / (pix.width * pix.height)
        if visible < 0.08:
            return None
    return image


def extract_page_images(doc: fitz.Document, page: fitz.Page, page_num: int, save_files: bool = True) -> list[dict[str, Any]]:
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    records: list[dict[str, Any]] = []
    seen: set[int] = set()
    for image_index, item in enumerate(page.get_images(full=True), start=1):
        xref, smask_xref = item[0], item[1]
        if xref in seen:
            continue
        seen.add(xref)
        try:
            image = rgb_pixmap(doc, xref, smask_xref)
        except Exception as exc:  # Corrupt/unsupported image streams should not stop the catalog run.
            print(f"page {page_num}: skipped image xref {xref}: {exc}", file=sys.stderr)
            continue
        if image is None:
            continue
        image.thumbnail((1000, 1000), Image.Resampling.LANCZOS)
        filename = f"page_{page_num}_img_{len(records) + 1}.png"
        if save_files:
            image.save(IMAGE_DIR / filename, format="PNG", optimize=True)
        rects = page.get_image_rects(xref)
        rect = rects[0] if rects else fitz.Rect(0, 0, page.rect.width, page.rect.height)
        records.append(
            {
                "src": f"/images/catalog/{filename}",
                "xref": xref,
                "width": image.width,
                "height": image.height,
                "rect": [rect.x0, rect.y0, rect.x1, rect.y1],
                "originalIndex": image_index,
            }
        )
    return records


def raw_block_text(block: tuple[Any, ...]) -> str:
    return str(block[4]) if len(block) > 4 else ""


def block_text(block: tuple[Any, ...]) -> str:
    return clean(raw_block_text(block))


def nearest_product_context(
    blocks: list[tuple[Any, ...]], model_match: re.Match[str], model_block: tuple[Any, ...]
) -> str:
    model_y = (float(model_block[1]) + float(model_block[3])) / 2
    model_x = (float(model_block[0]) + float(model_block[2])) / 2
    candidates: list[tuple[float, str]] = []
    for block in blocks:
        text = block_text(block)
        if not text or MODEL_RE.search(text) or PRICE_RE.search(text):
            continue
        if len(text) > 260:
            continue
        y = (float(block[1]) + float(block[3])) / 2
        x = (float(block[0]) + float(block[2])) / 2
        distance = abs(y - model_y) + abs(x - model_x) * 0.72
        if distance > 145:
            continue
        candidates.append((distance, text))
    candidates.sort(key=lambda item: item[0])
    return clean(" ".join(text for _, text in candidates[:5]))


def assign_image(model_block: tuple[Any, ...], images: list[dict[str, Any]]) -> str | None:
    if not images:
        return None
    mx = (float(model_block[0]) + float(model_block[2])) / 2
    my = (float(model_block[1]) + float(model_block[3])) / 2
    best: tuple[float, str] | None = None
    for image in images:
        x0, y0, x1, y1 = image["rect"]
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        # Give extra weight to objects that share the same product column/row.
        distance = abs(cx - mx) + abs(cy - my) * 0.8
        if x0 <= mx <= x1 and y0 <= my <= y1:
            distance *= 0.55
        if best is None or distance < best[0]:
            best = (distance, image["src"])
    return best[1] if best else None


def infer_name(context: str, model: str, category: str) -> str:
    ignored = re.compile(
        r"(?:^\d+\.?$|^www\.|^incluye\s*:|^capacidad\s*:|^medidas?\s*:|^medida\s*:|"
        r"^nota\s*:|^voltaje\s*:|^potencia\s*:|^frecuencia\s*:|^las im[aá]genes|"
        r"^libre de bpa$|^apto|^acero inoxidable$|^filo de oro|^\$|^mod\.?\s*\w+)",
        re.I,
    )
    fragments: list[str] = []
    for raw_line in context.splitlines():
        line = clean(raw_line)
        line = re.sub(r"^\d+\.\s*", "", line)
        if not line or len(line) < 3 or ignored.search(line):
            continue
        if PRICE_RE.search(line) or MODEL_RE.search(line) or PIECES_RE.search(line):
            continue
        if CAPACITY_RE.search(line) or MEASUREMENT_RE.search(line):
            continue
        if any(pattern.search(line) for _, pattern in ATTRIBUTE_PATTERNS):
            continue
        if category_for_line(line) or re.fullmatch(r"[\d\W]+", line):
            continue
        fragments.append(line)
        if len(fragments) >= 3:
            break
    if not fragments:
        return f"Artículo {model}"
    return clean(" ".join(fragments))[:100]


def extract_included_pieces(context: str) -> list[str]:
    lines = [clean(line) for line in context.splitlines()]
    start = next((index for index, line in enumerate(lines) if re.match(r"incluye\s*:?", line, re.I)), None)
    if start is None:
        return []
    included: list[str] = []
    for line in lines[start + 1 :]:
        if not line or PRICE_RE.search(line) or MODEL_RE.search(line):
            continue
        if re.match(r"(?:capacidad|medidas?|medida|nota|libre de bpa|filo de oro|acero inoxidable)", line, re.I):
            break
        if len(line) < 3 or re.fullmatch(r"[\d\W]+", line):
            continue
        included.append(line)
        if len(included) >= 12:
            break
    return included


def nearest_include_block(blocks: list[tuple[Any, ...]], model_block: tuple[Any, ...]) -> str:
    mx = (float(model_block[0]) + float(model_block[2])) / 2
    my = (float(model_block[1]) + float(model_block[3])) / 2
    closest: tuple[float, str] | None = None
    for block in blocks:
        text = block_text(block)
        if not re.search(r"\bincluye\s*:?", text, re.I):
            continue
        x = (float(block[0]) + float(block[2])) / 2
        y = (float(block[1]) + float(block[3])) / 2
        distance = abs(x - mx) * 0.8 + abs(y - my)
        if closest is None or distance < closest[0]:
            closest = (distance, raw_block_text(block))
    return closest[1] if closest and closest[0] <= 165 else ""


def nearest_price(page: fitz.Page, model: str, model_block: tuple[Any, ...]) -> float | None:
    words = page.get_text("words", sort=True)
    code_words = [word for word in words if model.casefold() in str(word[4]).casefold()]
    if code_words:
        code = min(code_words, key=lambda word: len(str(word[4])))
        mx, my = (float(code[0]) + float(code[2])) / 2, (float(code[1]) + float(code[3])) / 2
    else:
        mx = (float(model_block[0]) + float(model_block[2])) / 2
        my = (float(model_block[1]) + float(model_block[3])) / 2
    closest: tuple[float, float] | None = None
    for word in words:
        match = PRICE_RE.fullmatch(str(word[4]).strip())
        if not match:
            continue
        x, y = (float(word[0]) + float(word[2])) / 2, (float(word[1]) + float(word[3])) / 2
        if abs(x - mx) > 190:
            continue
        distance = abs(x - mx) * 0.8 + abs(y - my)
        if closest is None or distance < closest[0]:
            closest = (distance, float(match.group(1).replace(",", "")))
    return closest[1] if closest and closest[0] <= 185 else None


def main() -> None:
    if not PDF_PATH.exists():
        raise SystemExit(f"Catalog PDF not found: {PDF_PATH}")
    (ROOT / "src" / "data").mkdir(parents=True, exist_ok=True)
    doc = fitz.open(PDF_PATH)
    products: list[dict[str, Any]] = []
    extracted_image_paths: set[str] = set()
    current_category = "Hogar"
    save_images = "--skip-image-write" not in sys.argv
    for page_index in range(len(doc)):
        page = doc[page_index]
        page_num = page_index + 1
        text = page.get_text("text", sort=True)
        current_category = detect_category(text, current_category)
        blocks = [block for block in page.get_text("blocks", sort=True) if len(block) >= 5]
        images = extract_page_images(doc, page, page_num, save_files=save_images)
        extracted_image_paths.update(image["src"] for image in images)
        for block in blocks:
            content = raw_block_text(block)
            model_matches = list(MODEL_RE.finditer(content))
            for match_index, match in enumerate(model_matches):
                model = re.sub(r"[.,]+$", "", match.group(1)).upper()
                segment_start = model_matches[match_index - 1].end() if match_index > 0 else 0
                segment_end = model_matches[match_index + 1].start() if match_index + 1 < len(model_matches) else len(content)
                segment = content[segment_start:segment_end]
                context = segment.replace(match.group(0), "", 1)
                if len(clean(context)) < 12:
                    context = content[: match.start()] + content[match.end() :]
                if len(clean(context)) < 12:
                    context = nearest_product_context(blocks, match, block)
                around = f"{segment} {context}"
                price_match = PRICE_RE.search(around)
                price = None
                if price_match:
                    try:
                        price = float(price_match.group(1).replace(",", ""))
                    except ValueError:
                        pass
                else:
                    price = nearest_price(page, model, block)
                pieces_match = PIECES_RE.search(around)
                full_measurements = MEASUREMENT_RE.findall(around)
                capacities = [
                    value for value in CAPACITY_RE.findall(around)
                    if not any(re.search(re.escape(value), measurement, re.I) for measurement in full_measurements)
                ]
                dimensions = list(dict.fromkeys([*full_measurements, *capacities]))
                normalized_product_text = clean(around)
                attributes = [label for label, pattern in ATTRIBUTE_PATTERNS if pattern.search(normalized_product_text)]
                included_context = context if extract_included_pieces(context) else nearest_include_block(blocks, block)
                products.append(
                    {
                        "id": f"{page_num}-{model}-{len(products) + 1}",
                        "name": infer_name(context or content, model, current_category),
                        "model": model,
                        "category": current_category,
                        "price": price,
                        "pieces": int(pieces_match.group(1)) if pieces_match else None,
                        "includedPieces": extract_included_pieces(included_context),
                        "measurements": dimensions,
                        "attributes": attributes,
                        "description": clean(context) or None,
                        "page": page_num,
                        "image": assign_image(block, images),
                        "imagesOnPage": [image["src"] for image in images],
                    }
                )
    # Deduplicate repeated text-layer records while preserving the first, best mapping.
    deduped: dict[tuple[int, str], dict[str, Any]] = {}
    for product in products:
        key = (product["page"], product["model"])
        if key not in deduped or (not deduped[key].get("image") and product.get("image")):
            deduped[key] = product
    result = list(deduped.values())
    for product in result:
        product["images"] = [product["image"]] if product.get("image") else []
        product.pop("imagesOnPage", None)
    for image_file in IMAGE_DIR.glob("page_*_img_*.png"):
        if f"/images/catalog/{image_file.name}" not in extracted_image_paths:
            image_file.unlink()
    JSON_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    typescript = """export type ProductCategory = 'Mesa' | 'Café y Té' | 'Kids' | 'Cocina' | 'Baterías' | 'Hogar'

export interface Product {
  id: string
  name: string
  model: string
  category: ProductCategory
  price: number | null
  pieces: number | null
  includedPieces: string[]
  measurements: string[]
  attributes: string[]
  description: string | null
  page: number
  image: string | null
  images: string[]
}

export const categories: ProductCategory[] = ['Mesa', 'Café y Té', 'Kids', 'Cocina', 'Baterías', 'Hogar']

export const products: Product[] = """ + json.dumps(result, ensure_ascii=False, indent=2) + ";\n"
    TS_PATH.write_text(typescript, encoding="utf-8")
    print(f"Pages: {len(doc)}")
    print(f"Products extracted: {len(result)}")
    print(f"Eligible images: {len(extracted_image_paths)}")
    print(f"Data: {JSON_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
