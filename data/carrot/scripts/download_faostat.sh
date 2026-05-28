#!/usr/bin/env bash
# v8 livestock: standard 9 zips
set -uo pipefail
BASE="https://bulks-faostat.fao.org/production"
OUT="$(dirname "$0")/faostat/raw"
mkdir -p "$OUT"
FILES=(
  "Production_Crops_Livestock_E_All_Data_(Normalized).zip"
  "Production_Indices_E_All_Data_(Normalized).zip"
  "Value_of_Production_E_All_Data_(Normalized).zip"
  "Trade_CropsLivestock_E_All_Data_(Normalized).zip"
  "Trade_DetailedTradeMatrix_E_All_Data_(Normalized).zip"
  "Prices_E_All_Data_(Normalized).zip"
  "FoodBalanceSheets_E_All_Data_(Normalized).zip"
  "FoodBalanceSheetsHistoric_E_All_Data_(Normalized).zip"
  "SUA_Crops_Livestock_E_All_Data_(Normalized).zip"
)
for f in "${FILES[@]}"; do
  echo "[*] $f"
  if curl -L --fail --retry 3 --retry-delay 5 -o "$OUT/$f" "$BASE/$f"; then
    echo "    OK $(du -h "$OUT/$f" | cut -f1)"
  else
    echo "    FAIL $f"; rm -f "$OUT/$f"
  fi
done
