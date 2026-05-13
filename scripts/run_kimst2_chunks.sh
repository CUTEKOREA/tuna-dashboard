#!/bin/bash
export PYTHONPATH="${PYTHONPATH}:/Users/idong-geon/연구자동화애이전트들/tuna-dashboard"

# Total files: 513. Chunks of 100 means index 0 to 5.
echo "Processing chunk 0 (files 1-100)..."
python3 scripts/convert_kimst_reports2_chunked.py --chunk-size 100 --chunk-index 0

echo "Processing chunk 1 (files 101-200)..."
python3 scripts/convert_kimst_reports2_chunked.py --chunk-size 100 --chunk-index 1

echo "Processing chunk 2 (files 201-300)..."
python3 scripts/convert_kimst_reports2_chunked.py --chunk-size 100 --chunk-index 2

echo "Processing chunk 3 (files 301-400)..."
python3 scripts/convert_kimst_reports2_chunked.py --chunk-size 100 --chunk-index 3

echo "Processing chunk 4 (files 401-500)..."
python3 scripts/convert_kimst_reports2_chunked.py --chunk-size 100 --chunk-index 4

echo "Processing chunk 5 (files 501-513)..."
python3 scripts/convert_kimst_reports2_chunked.py --chunk-size 100 --chunk-index 5

echo "All chunks processed successfully."
