import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from build_index import build

def _art(root, sub, name, typ, summary, aliases="[]", conf="A"):
    (root / sub).mkdir(parents=True, exist_ok=True)
    (root / sub / f"{name}.md").write_text(
        f"---\ntype: {typ}\nname: {name}\naliases: {aliases}\nlast_verified: 2026-09-09\nconfidence: {conf}\n---\n"
        f"# {name}\n\n## 요약\n{summary}\n둘째 줄은 안 나온다.\n\n## 사실\n- x [출처 1]\n\n## 출처\n[1] a\n",
        encoding="utf-8")

def test_index_groups_by_type_in_fixed_order_and_sorts_by_name(tmp_path):
    root = tmp_path / "wiki"
    _art(root, "rfmo", "IATTC", "rfmo", "동태평양 참치 위원회")
    _art(root, "companies", "사조그룹", "company", "한국 원양 2위", aliases="[Sajo]")
    _art(root, "companies", "동원산업", "company", "한국 원양 1위", aliases="[Dongwon Industries, 동원]", conf="B")
    out = build(root)
    assert out.index("## 기업 (2)") < out.index("## RFMO (1)")
    rows = [l for l in out.splitlines() if l.startswith("| [[")]
    assert rows[0].startswith("| [[동원산업]] | Dongwon Industries, 동원 | 한국 원양 1위 | 2026-09-09 | B |")
    assert rows[1].startswith("| [[사조그룹]] | Sajo | 한국 원양 2위 | 2026-09-09 | A |")
    assert rows[2].startswith("| [[IATTC]] |  | 동태평양 참치 위원회 | 2026-09-09 | A |")

def test_summary_truncated_to_80_chars(tmp_path):
    root = tmp_path / "wiki"
    _art(root, "gear", "선망", "gear", "가" * 120)
    out = build(root)
    row = [l for l in out.splitlines() if l.startswith("| [[선망]]")][0]
    summary = row.split("|")[3].strip()
    assert len(summary) == 81 and summary.endswith("…")

def test_index_and_template_are_skipped(tmp_path):
    root = tmp_path / "wiki"
    _art(root, "gear", "선망", "gear", "요약")
    (root / "INDEX.md").write_text("old", encoding="utf-8")
    (root / "_template.md").write_text("---\ntype: company\nname: 개체명\nlast_verified: 2026-09-09\nconfidence: C\n---\n## 요약\nt\n", encoding="utf-8")
    out = build(root)
    assert "개체명" not in out
    assert "## 어법 (1)" in out

def test_cli_writes_index(tmp_path):
    import subprocess
    root = tmp_path / "wiki"
    _art(root, "certs", "MSC", "cert", "해양관리협의회 인증")
    script = Path(__file__).resolve().parents[1] / "build_index.py"
    r = subprocess.run([sys.executable, str(script), "--wiki-root", str(root)], capture_output=True, text=True)
    assert r.returncode == 0 and "INDEX: 1 문서" in r.stdout
    assert "[[MSC]]" in (root / "INDEX.md").read_text(encoding="utf-8")
