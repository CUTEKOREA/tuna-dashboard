from pathlib import Path

WIKI = Path(__file__).resolve().parents[2]
REPO = WIKI.parent

def test_dirs_exist():
    for d in ("companies", "rfmo", "gear", "certs", "regimes", "scripts"):
        assert (WIKI / d).is_dir(), d

def test_template_has_six_sections():
    t = (WIKI / "_template.md").read_text(encoding="utf-8")
    for h in ("## 요약", "## 사실", "## 관계", "## 미확인", "## 출처", "## 정정 이력"):
        assert h in t, h
    assert t.startswith("---\n")

def test_readme_has_rule_and_claude_imports_it():
    r = (WIKI / "README.md").read_text(encoding="utf-8")
    assert "wiki/INDEX.md" in r and "## 사실" in r and "보고서에 쓰기 전에 위키" in r
    c = (REPO / "CLAUDE.md").read_text(encoding="utf-8")
    assert "@wiki/README.md" in c
