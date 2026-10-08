import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from check_article import check

GOOD = """---
type: company
name: 동원산업
last_verified: 2026-09-09
confidence: A
---
# 동원산업

## 요약
요약.

## 사실
- 선망선 12척 [출처 2]
- 본사 서울 [출처 1]

## 관계
- [[IATTC]] 등록

## 미확인
- 없음

## 출처
[1] 프로필.md
[2] 등록부.html

## 정정 이력
- 2026-09-09 초기
"""

def _wiki(tmp_path, article_text, link_targets=()):
    root = tmp_path / "wiki"
    (root / "companies").mkdir(parents=True)
    (root / "rfmo").mkdir()
    for t in link_targets:
        (root / "rfmo" / f"{t}.md").write_text("---\ntype: rfmo\nname: x\nlast_verified: 2026-09-09\nconfidence: A\n---\n## 요약\nx\n", encoding="utf-8")
    p = root / "companies" / "동원산업.md"
    p.write_text(article_text, encoding="utf-8")
    return p, root

def test_good_article_passes(tmp_path):
    p, root = _wiki(tmp_path, GOOD, link_targets=("IATTC",))
    errors, warnings = check(p, root)
    assert errors == []
    assert warnings == []

def test_missing_frontmatter_key_is_error(tmp_path):
    bad = GOOD.replace("confidence: A\n", "")
    p, root = _wiki(tmp_path, bad, link_targets=("IATTC",))
    errors, _ = check(p, root)
    assert any("confidence" in e for e in errors)

def test_bad_type_value_is_error(tmp_path):
    bad = GOOD.replace("type: company", "type: firm")
    p, root = _wiki(tmp_path, bad, link_targets=("IATTC",))
    errors, _ = check(p, root)
    assert any("type" in e for e in errors)

def test_fact_bullet_without_source_is_error(tmp_path):
    bad = GOOD.replace("- 본사 서울 [출처 1]", "- 본사 서울")
    p, root = _wiki(tmp_path, bad, link_targets=("IATTC",))
    errors, _ = check(p, root)
    assert any("본사 서울" in e and "출처" in e for e in errors)

def test_undefined_source_ref_is_error(tmp_path):
    bad = GOOD.replace("[출처 2]", "[출처 9]")
    p, root = _wiki(tmp_path, bad, link_targets=("IATTC",))
    errors, _ = check(p, root)
    assert any("[출처 9]" in e for e in errors)

def test_broken_wikilink_is_warning_not_error(tmp_path):
    p, root = _wiki(tmp_path, GOOD, link_targets=())
    errors, warnings = check(p, root)
    assert errors == []
    assert any("IATTC" in w for w in warnings)

def test_cli_exit_code_equals_error_count(tmp_path):
    import subprocess
    bad = GOOD.replace("- 본사 서울 [출처 1]", "- 본사 서울").replace("confidence: A\n", "")
    p, root = _wiki(tmp_path, bad, link_targets=("IATTC",))
    script = Path(__file__).resolve().parents[1] / "check_article.py"
    r = subprocess.run([sys.executable, str(script), str(p), "--wiki-root", str(root)],
                       capture_output=True, text=True)
    assert r.returncode == 2, r.stdout + r.stderr
    assert r.stdout.count("ERR:") == 2
