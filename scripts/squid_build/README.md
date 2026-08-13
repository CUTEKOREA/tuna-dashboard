# squid v5 archive builder

The builder reads the squid archive without writing to it and always emits the complete 39-widget contract.

From the repository root:

```bash
python3 -m scripts.squid_build --out public/data/squid_v5.json
```

Useful focused runs retain all 39 skeleton rows and populate only the requested stage:

```bash
python3 -m scripts.squid_build --out /tmp/squid-governance.json --only governance
python3 -m scripts.squid_build --out /tmp/squid-fishstat.json --only fishstat
python3 -m scripts.squid_build --out /tmp/squid-one-widget.json --only A_peru_pota_timeline
```

`--archive-root` and `--spec` can point to controlled fixtures. The default archive root is the Google Drive squid directory from `docs/SQUID_V5_HANDOFF.md`.

Build order is governance, KMI, FishStat, KCS/Comtrade/HS, Peru/Chile, 21 config-driven document widgets, then four derivations. The document stage includes structured parsers for the EFPR squid price table, the MOF TAC coverage table, and SPRFMO CMM18 effort limits.

Markdown/HTML remains the first extraction path. For a PDF whose same-named Markdown twin is missing or lacks the configured table evidence, the builder may run `pdftotext -layout <pdf> -` in memory. It writes neither the PDF nor extracted text to the Drive archive, keeps the archive PDF as the citation path, and records layout re-extraction in `methodology`. A missing or unextractable document config leaves only that widget as `data: []` with `chartType: "card"`.

Verification:

```bash
python3 scripts/squid_build/tests/test_squid_build.py
python3 scripts/validate_squid_v5.py public/data/squid_v5.json
```
