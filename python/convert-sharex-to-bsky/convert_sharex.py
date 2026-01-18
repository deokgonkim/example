#!/usr/bin/env python3
"""Convert a Twitter/X share intent URL to Bluesky and Mastodon share URLs."""

from __future__ import annotations

import argparse
import sys
from urllib.parse import parse_qs, quote, urlparse


def build_share_text(intent_url: str) -> str:
    parsed = urlparse(intent_url)
    params = parse_qs(parsed.query)

    text = (params.get("text") or [""])[0].strip()
    url = (params.get("url") or [""])[0].strip()

    if text and url:
        return f"{text} {url}"
    if text:
        return text
    if url:
        return url

    return ""


def normalize_instance(instance: str) -> str:
    if not instance.startswith("http://") and not instance.startswith("https://"):
        instance = f"https://{instance}"
    return instance.rstrip("/")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert a Twitter/X share intent URL to Bluesky and Mastodon share URLs."
    )
    parser.add_argument(
        "intent_url",
        nargs="?",
        help="Twitter/X intent URL (leave blank to paste when prompted)",
    )
    parser.add_argument(
        "--mastodon",
        default="https://mastodon.social",
        help="Mastodon instance base URL (default: https://mastodon.social)",
    )
    args = parser.parse_args()

    intent_url = args.intent_url
    if not intent_url:
        intent_url = input("Paste Twitter/X intent URL: ").strip()

    share_text = build_share_text(intent_url)
    if not share_text:
        print("Could not find share text or URL in the intent link.", file=sys.stderr)
        return 1

    encoded = quote(share_text, safe="")
    bluesky_url = f"https://bsky.app/intent/compose?text={encoded}"

    instance = normalize_instance(args.mastodon)
    mastodon_url = f"{instance}/share?text={encoded}"

    print("bluesky:", bluesky_url)
    print("mastodon:", mastodon_url)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
