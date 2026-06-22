"""Parse the New Spain SVG into absolute (pixel) geometry.

Handles nested group + per-element `transform` composition (translate / scale /
matrix), which the original build script ignored. Coordinates returned are in the
SVG user space *before* the root viewBox flip, i.e. raw matplotlib-friendly pixels
where +y points down (as in SVG).
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from xml.etree import ElementTree as ET

import numpy as np
from svg.path import Close, Move, parse_path

SVG_NS = "{http://www.w3.org/2000/svg}"
INK_NS = "{http://www.inkscape.org/namespaces/inkscape}"

_NUM = r"[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?"


def _identity() -> np.ndarray:
    return np.array([[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]])


def parse_transform(value: str | None) -> np.ndarray:
    """Return a 3x3 affine matrix for an SVG transform attribute."""
    matrix = _identity()
    if not value:
        return matrix
    for name, args in re.findall(r"(\w+)\s*\(([^)]*)\)", value):
        nums = [float(n) for n in re.findall(_NUM, args)]
        m = _identity()
        if name == "translate":
            tx = nums[0] if nums else 0.0
            ty = nums[1] if len(nums) > 1 else 0.0
            m = np.array([[1, 0, tx], [0, 1, ty], [0, 0, 1]], dtype=float)
        elif name == "scale":
            sx = nums[0] if nums else 1.0
            sy = nums[1] if len(nums) > 1 else sx
            m = np.array([[sx, 0, 0], [0, sy, 0], [0, 0, 1]], dtype=float)
        elif name == "matrix" and len(nums) == 6:
            a, b, c, d, e, f = nums
            m = np.array([[a, c, e], [b, d, f], [0, 0, 1]], dtype=float)
        matrix = matrix @ m
    return matrix


def apply(matrix: np.ndarray, x: float, y: float) -> tuple[float, float]:
    vec = matrix @ np.array([x, y, 1.0])
    return float(vec[0]), float(vec[1])


def style_dict(element: ET.Element) -> dict[str, str]:
    out: dict[str, str] = {}
    style = element.get("style", "")
    for part in style.split(";"):
        if ":" in part:
            key, _, val = part.partition(":")
            out[key.strip()] = val.strip()
    return out


@dataclass
class Polyline:
    points: np.ndarray  # (N, 2)
    closed: bool
    fill: str
    layer: str
    css_class: str = ""


@dataclass
class Label:
    text: str
    x: float
    y: float
    layer: str


@dataclass
class ParsedSvg:
    polylines: list[Polyline] = field(default_factory=list)
    labels: list[Label] = field(default_factory=list)


def _sample_path(d: str, matrix: np.ndarray, step: float = 4.0) -> list[Polyline]:
    """Split a path 'd' into subpaths, sampling curves into points (absolute coords)."""
    try:
        path = parse_path(d)
    except Exception:
        return []

    out: list[Polyline] = []
    current: list[tuple[float, float]] = []
    closed = False

    def flush() -> None:
        nonlocal current, closed
        if len(current) >= 2:
            pts = np.array([apply(matrix, x, y) for x, y in current], dtype=float)
            out.append(Polyline(points=pts, closed=closed, fill="", layer=""))
        current = []
        closed = False

    for seg in path:
        if isinstance(seg, Move):
            flush()
            current = [(seg.end.real, seg.end.imag)]
            continue
        if not current:
            current = [(seg.start.real, seg.start.imag)]
        length = seg.length(error=1e-3) if hasattr(seg, "length") else 0.0
        steps = int(min(max(2, length / step + 1), 120))
        for i in range(1, steps + 1):
            p = seg.point(i / steps)
            current.append((p.real, p.imag))
        if isinstance(seg, Close):
            closed = True
            flush()
    flush()
    return out


def parse_svg(svg_path: Path, step: float = 4.0) -> ParsedSvg:
    root = ET.parse(svg_path).getroot()
    result = ParsedSvg()

    def walk(element: ET.Element, matrix: np.ndarray, layer: str) -> None:
        local = matrix @ parse_transform(element.get("transform"))
        tag = element.tag
        if tag == f"{SVG_NS}g":
            label = element.get(f"{INK_NS}label") or element.get("id", layer)
            for child in element:
                walk(child, local, label)
            return
        if tag == f"{SVG_NS}path":
            d = element.get("d", "")
            if not d:
                return
            fill = style_dict(element).get("fill", element.get("fill", ""))
            css_class = element.get("class", "")
            for poly in _sample_path(d, local, step=step):
                poly.fill = fill
                poly.layer = layer
                poly.css_class = css_class
                result.polylines.append(poly)
            return
        if tag == f"{SVG_NS}rect":
            x = float(element.get("x", 0))
            y = float(element.get("y", 0))
            w = float(element.get("width", 0))
            h = float(element.get("height", 0))
            corners = [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]
            pts = np.array([apply(local, cx, cy) for cx, cy in corners], dtype=float)
            fill = style_dict(element).get("fill", element.get("fill", ""))
            result.polylines.append(Polyline(points=pts, closed=True, fill=fill, layer=layer))
            return
        if tag == f"{SVG_NS}text":
            parts: list[str] = []
            x = element.get("x")
            y = element.get("y")
            for tspan in element.iter(f"{SVG_NS}tspan"):
                if tspan.text:
                    parts.append(tspan.text.strip())
                if x is None:
                    x = tspan.get("x")
                if y is None:
                    y = tspan.get("y")
            if element.text and element.text.strip():
                parts.insert(0, element.text.strip())
            label_text = " ".join(p for p in parts if p)
            if label_text and x is not None and y is not None:
                ax, ay = apply(local, float(x), float(y))
                result.labels.append(Label(text=label_text, x=ax, y=ay, layer=layer))
            return
        for child in element:
            walk(child, local, layer)

    walk(root, _identity(), "root")
    return result
