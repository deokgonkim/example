#!/usr/bin/env python3
import argparse
import csv
from collections import Counter
from pathlib import Path

import matplotlib.pyplot as plt


def load_counts(csv_path, column):
    counts = Counter()
    with csv_path.open("r", newline="", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            value = (row.get(column) or "").strip()
            if not value:
                value = "Unknown"
            counts[value] += 1
    return counts


def make_pie_chart(counts, title, output_path, top_n):
    sorted_items = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    if top_n > 0 and len(sorted_items) > top_n:
        top_items = sorted_items[:top_n]
        other_count = sum(count for _, count in sorted_items[top_n:])
        sorted_items = top_items + [("Other", other_count)]

    labels = [item[0] for item in sorted_items]
    sizes = [item[1] for item in sorted_items]

    plt.figure(figsize=(10, 8))
    plt.pie(
        sizes,
        labels=labels,
        autopct="%1.1f%%",
        startangle=140,
        textprops={"fontsize": 9},
    )
    plt.title(title)
    plt.axis("equal")
    plt.tight_layout()
    plt.savefig(output_path, dpi=200)
    plt.close()


def main():
    parser = argparse.ArgumentParser(
        description="Create pie charts from metadata CSV based on camera make/model."
    )
    parser.add_argument(
        "csv_path",
        nargs="?",
        default="metadata.csv",
        help="Metadata CSV file path (default: metadata.csv).",
    )
    parser.add_argument(
        "--make-output",
        default="camera_make_pie.png",
        help="Output file for make pie chart (default: camera_make_pie.png).",
    )
    parser.add_argument(
        "--model-output",
        default="camera_model_pie.png",
        help="Output file for model pie chart (default: camera_model_pie.png).",
    )
    parser.add_argument(
        "--top-models",
        type=int,
        default=12,
        help="Maximum number of model slices before grouping the rest into 'Other' (default: 12).",
    )
    args = parser.parse_args()

    csv_path = Path(args.csv_path).resolve()
    if not csv_path.exists():
        raise SystemExit(f"Error: CSV file not found: {csv_path}")

    make_counts = load_counts(csv_path, "Make")
    model_counts = load_counts(csv_path, "Model")

    if not make_counts or not model_counts:
        raise SystemExit("Error: CSV has no rows to chart.")

    make_output = Path(args.make_output).resolve()
    model_output = Path(args.model_output).resolve()

    make_pie_chart(make_counts, "Camera Make Distribution", make_output, top_n=0)
    make_pie_chart(
        model_counts,
        "Camera Model Distribution",
        model_output,
        top_n=max(0, args.top_models),
    )

    print(f"Done: {make_output}")
    print(f"Done: {model_output}")


if __name__ == "__main__":
    main()
