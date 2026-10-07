#!/usr/bin/env python3
"""Turn the full Zedtronix dashboard HTML document into an Artifact page body.

Artifacts wrap the page in their own <!doctype>/<html>/<head>/<body> skeleton,
so those wrapper lines (and the charset/viewport metas) are removed. Everything
else - title, font links, styles, markup and script - is kept byte for byte.

Usage: python3 make_artifact.py <input.html> <output.html>
"""
import re
import sys

WRAPPERS = re.compile(
    r'^(<!doctype html>|<html[^>]*>|</html>|<head>|</head>|<body>|</body>|<meta charset[^>]*>|<meta name="viewport"[^>]*>)\s*$',
    re.IGNORECASE,
)

def main() -> None:
    if len(sys.argv) != 3:
        sys.exit("Usage: python3 make_artifact.py <input.html> <output.html>")
    src, dst = sys.argv[1], sys.argv[2]
    with open(src, encoding="utf-8") as f:
        lines = f.read().splitlines(keepends=True)
    kept = [line for line in lines if not WRAPPERS.match(line.strip())]
    with open(dst, "w", encoding="utf-8") as f:
        f.writelines(kept)
    print(f"Wrote {dst} ({len(lines) - len(kept)} wrapper lines removed)")

if __name__ == "__main__":
    main()
