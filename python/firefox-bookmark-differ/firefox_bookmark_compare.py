#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Compare two Firefox bookmark backup JSON files semantically.

Usage:
    python firefox_bookmark_compare.py old.json new.json
    python firefox_bookmark_compare.py old.json new.json --normalized-old norm-old.json --normalized-new norm-new.json
    python firefox_bookmark_compare.py old.json new.json --json

Notes:
- Ignores volatile fields like id / dateAdded / lastModified.
- Compares bookmarks by normalized records: path, title, uri.
- Attempts to classify differences as:
    * added
    * removed
    * moved
    * renamed
    * moved_and_renamed
    * url_changed
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict, deque
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple


Bookmark = Dict[str, str]


def load_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def normalize_root_title(title: str) -> str:
    """
    Map Firefox root/container titles to stable path names where possible.
    """
    if title is None:
        return ""

    t = str(title).strip()

    mapping = {
        "Bookmarks Toolbar": "toolbar",
        "Bookmarks Menu": "menu",
        "Other Bookmarks": "unfiled",
        "Mobile Bookmarks": "mobile",
        "toolbar": "toolbar",
        "menu": "menu",
        "unfiled": "unfiled",
        "mobile": "mobile",
        "root": "",
        "placesRoot": "",
    }
    return mapping.get(t, t)


def sanitize_component(value: Any) -> str:
    if value is None:
        return ""
    s = str(value).replace("/", "／").strip()
    return s


def build_path(parts: List[str]) -> str:
    cleaned = [p for p in parts if p]
    return "/" + "/".join(cleaned) if cleaned else "/"


def is_probably_folder(node: Dict[str, Any]) -> bool:
    return "children" in node and isinstance(node.get("children"), list)


def is_probably_bookmark(node: Dict[str, Any]) -> bool:
    return isinstance(node.get("uri"), str) and node["uri"] != ""


def should_skip_node(node: Dict[str, Any], include_queries: bool) -> bool:
    """
    Skip separators and optionally place: query bookmarks.
    """
    if node.get("type") == "text/x-moz-place-separator":
        return True

    uri = node.get("uri")
    if not include_queries and isinstance(uri, str) and uri.startswith("place:"):
        return True

    return False


def extract_bookmarks(data: Any, include_queries: bool = False) -> List[Bookmark]:
    """
    Recursively flatten Firefox bookmark backup JSON into:
        [{"path": "/toolbar/Work", "title": "GitHub", "uri": "https://github.com/"}]
    """
    results: List[Bookmark] = []

    def walk(node: Any, path_parts: List[str]) -> None:
        if not isinstance(node, dict):
            return

        if should_skip_node(node, include_queries=include_queries):
            return

        title = sanitize_component(node.get("title", ""))

        if is_probably_bookmark(node):
            results.append(
                {
                    "path": build_path(path_parts),
                    "title": title,
                    "uri": node["uri"],
                }
            )

        if is_probably_folder(node):
            next_parts = path_parts.copy()

            folder_name = normalize_root_title(title)
            if folder_name:
                next_parts.append(folder_name)

            for child in node.get("children", []):
                walk(child, next_parts)

    # Some exports have a single root object, some may wrap differently.
    if isinstance(data, dict):
        walk(data, [])
    elif isinstance(data, list):
        for item in data:
            walk(item, [])
    else:
        raise ValueError("Unsupported JSON top-level structure.")

    results.sort(key=lambda x: (x["path"], x["title"], x["uri"]))
    return results


def multiset(entries: Iterable[Bookmark], key_fields: Tuple[str, ...]) -> Counter:
    return Counter(tuple(entry[k] for k in key_fields) for entry in entries)


def expand_counter(counter: Counter, field_names: Tuple[str, ...]) -> List[Dict[str, str]]:
    items: List[Dict[str, str]] = []
    for key, count in counter.items():
        for _ in range(count):
            items.append({name: value for name, value in zip(field_names, key)})
    return items


def consume_one(group: Dict[str, deque], key: str) -> Dict[str, str] | None:
    q = group.get(key)
    if q:
        return q.popleft()
    return None


def classify_changes(old_entries: List[Bookmark], new_entries: List[Bookmark]) -> Dict[str, Any]:
    """
    Comparison strategy:
    1) Remove exact matches by (path, title, uri)
    2) Match same (path, title) but URI changed => url_changed
    3) Match same URI but path/title changed => moved / renamed / moved_and_renamed
    4) Remainder => added / removed
    """
    exact_fields = ("path", "title", "uri")
    exact_old = multiset(old_entries, exact_fields)
    exact_new = multiset(new_entries, exact_fields)

    common_exact = exact_old & exact_new
    rem_old_exact = exact_old - common_exact
    rem_new_exact = exact_new - common_exact

    rem_old = expand_counter(rem_old_exact, exact_fields)
    rem_new = expand_counter(rem_new_exact, exact_fields)

    url_changed: List[Dict[str, str]] = []
    moved: List[Dict[str, str]] = []
    renamed: List[Dict[str, str]] = []
    moved_and_renamed: List[Dict[str, str]] = []

    # Step 2: same path+title, different URI => url_changed
    old_by_path_title: Dict[str, deque] = defaultdict(deque)
    new_by_path_title: Dict[str, deque] = defaultdict(deque)

    for e in rem_old:
        old_by_path_title[f"{e['path']}\0{e['title']}"].append(e)
    for e in rem_new:
        new_by_path_title[f"{e['path']}\0{e['title']}"].append(e)

    consumed_old_ids = set()
    consumed_new_ids = set()

    def entry_id(e: Dict[str, str]) -> Tuple[str, str, str]:
        return (e["path"], e["title"], e["uri"])

    for key in sorted(set(old_by_path_title) & set(new_by_path_title)):
        old_q = old_by_path_title[key]
        new_q = new_by_path_title[key]
        pair_count = min(len(old_q), len(new_q))

        for _ in range(pair_count):
            o = old_q.popleft()
            n = new_q.popleft()
            if o["uri"] != n["uri"]:
                url_changed.append(
                    {
                        "path": o["path"],
                        "title": o["title"],
                        "from_uri": o["uri"],
                        "to_uri": n["uri"],
                    }
                )
                consumed_old_ids.add(entry_id(o))
                consumed_new_ids.add(entry_id(n))

    rem_old2 = [e for e in rem_old if entry_id(e) not in consumed_old_ids]
    rem_new2 = [e for e in rem_new if entry_id(e) not in consumed_new_ids]

    # Step 3: same URI, path/title changed => moved / renamed
    old_by_uri: Dict[str, deque] = defaultdict(deque)
    new_by_uri: Dict[str, deque] = defaultdict(deque)

    for e in rem_old2:
        old_by_uri[e["uri"]].append(e)
    for e in rem_new2:
        new_by_uri[e["uri"]].append(e)

    consumed_old_ids.clear()
    consumed_new_ids.clear()

    for uri in sorted(set(old_by_uri) & set(new_by_uri)):
        old_q = old_by_uri[uri]
        new_q = new_by_uri[uri]
        pair_count = min(len(old_q), len(new_q))

        for _ in range(pair_count):
            o = old_q.popleft()
            n = new_q.popleft()

            path_changed = o["path"] != n["path"]
            title_changed = o["title"] != n["title"]

            if path_changed and title_changed:
                moved_and_renamed.append(
                    {
                        "uri": uri,
                        "from_path": o["path"],
                        "to_path": n["path"],
                        "from_title": o["title"],
                        "to_title": n["title"],
                    }
                )
            elif path_changed:
                moved.append(
                    {
                        "uri": uri,
                        "title": o["title"],
                        "from_path": o["path"],
                        "to_path": n["path"],
                    }
                )
            elif title_changed:
                renamed.append(
                    {
                        "uri": uri,
                        "path": o["path"],
                        "from_title": o["title"],
                        "to_title": n["title"],
                    }
                )
            else:
                # Should not happen because exact matches were already removed.
                pass

            consumed_old_ids.add(entry_id(o))
            consumed_new_ids.add(entry_id(n))

    rem_old3 = [e for e in rem_old2 if entry_id(e) not in consumed_old_ids]
    rem_new3 = [e for e in rem_new2 if entry_id(e) not in consumed_new_ids]

    # Leftovers
    removed = sorted(rem_old3, key=lambda x: (x["path"], x["title"], x["uri"]))
    added = sorted(rem_new3, key=lambda x: (x["path"], x["title"], x["uri"]))

    return {
        "summary": {
            "old_total": len(old_entries),
            "new_total": len(new_entries),
            "added": len(added),
            "removed": len(removed),
            "moved": len(moved),
            "renamed": len(renamed),
            "moved_and_renamed": len(moved_and_renamed),
            "url_changed": len(url_changed),
        },
        "added": added,
        "removed": removed,
        "moved": moved,
        "renamed": renamed,
        "moved_and_renamed": moved_and_renamed,
        "url_changed": url_changed,
    }


def print_text_report(result: Dict[str, Any]) -> None:
    s = result["summary"]

    print("== Summary ==")
    print(f"old_total           : {s['old_total']}")
    print(f"new_total           : {s['new_total']}")
    print(f"added               : {s['added']}")
    print(f"removed             : {s['removed']}")
    print(f"moved               : {s['moved']}")
    print(f"renamed             : {s['renamed']}")
    print(f"moved_and_renamed   : {s['moved_and_renamed']}")
    print(f"url_changed         : {s['url_changed']}")
    print()

    def section(title: str, rows: List[Dict[str, str]]) -> None:
        if not rows:
            return
        print(f"== {title} ({len(rows)}) ==")
        for row in rows:
            print(json.dumps(row, ensure_ascii=False))
        print()

    section("ADDED", result["added"])
    section("REMOVED", result["removed"])
    section("MOVED", result["moved"])
    section("RENAMED", result["renamed"])
    section("MOVED_AND_RENAMED", result["moved_and_renamed"])
    section("URL_CHANGED", result["url_changed"])


def save_json(path: str, data: Any) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Compare two Firefox bookmark backup JSON files semantically."
    )
    p.add_argument("old_json", help="Old Firefox bookmark backup JSON")
    p.add_argument("new_json", help="New Firefox bookmark backup JSON")
    p.add_argument(
        "--normalized-old",
        help="Write normalized old bookmark list to this file",
    )
    p.add_argument(
        "--normalized-new",
        help="Write normalized new bookmark list to this file",
    )
    p.add_argument(
        "--json",
        action="store_true",
        help="Print comparison result as JSON",
    )
    p.add_argument(
        "--include-queries",
        action="store_true",
        help="Include place: query bookmarks",
    )
    return p.parse_args()


def main() -> int:
    args = parse_args()

    try:
        old_data = load_json(args.old_json)
        new_data = load_json(args.new_json)

        old_entries = extract_bookmarks(old_data, include_queries=args.include_queries)
        new_entries = extract_bookmarks(new_data, include_queries=args.include_queries)

        if args.normalized_old:
            save_json(args.normalized_old, old_entries)
        if args.normalized_new:
            save_json(args.normalized_new, new_entries)

        result = classify_changes(old_entries, new_entries)

        if args.json:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print_text_report(result)

        return 0

    except FileNotFoundError as e:
        print(f"File not found: {e}", file=sys.stderr)
        return 2
    except json.JSONDecodeError as e:
        print(f"Invalid JSON: {e}", file=sys.stderr)
        return 3
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

