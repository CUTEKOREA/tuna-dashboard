import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from article import parse_article

SAMPLE = """---
type: company
name: 동원산업
aliases: [Dongwon Industries, 동원]
last_verified: 2026-09-09
confidence: A
---
# 동원산업

## 요약
한 줄 요약.
둘째 줄.

## 사실
- IATTC 등록 선망선 12척 [출처 2]

## 관계
- [[IATTC]] 등록

## 미확인
- 어획량 — 원양산업 통계연보

## 출처
[1] Drive/프로필.md (2026-08-30)
[2] RFMO등록부/iattc_ActivePS.html

## 정정 이력
- 2026-09-09 초기
"""

def _write(tmp_path, text):
    p = tmp_path / "동원산업.md"
    p.write_text(text, encoding="utf-8")
    return p

def test_frontmatter_parsed(tmp_path):
    a = parse_article(_write(tmp_path, SAMPLE))
    assert a.fm["type"] == "company"
    assert a.fm["name"] == "동원산업"
    assert a.fm["aliases"] == ["Dongwon Industries", "동원"]
    assert a.fm["confidence"] == "A"

def test_sections_split_and_blank_lines_dropped(tmp_path):
    a = parse_article(_write(tmp_path, SAMPLE))
    assert a.sections["요약"] == ["한 줄 요약.", "둘째 줄."]
    assert a.sections["사실"] == ["- IATTC 등록 선망선 12척 [출처 2]"]
    assert a.sections["출처"] == ["[1] Drive/프로필.md (2026-08-30)", "[2] RFMO등록부/iattc_ActivePS.html"]
    assert set(a.sections) == {"요약", "사실", "관계", "미확인", "출처", "정정 이력"}

def test_no_frontmatter_gives_empty_fm(tmp_path):
    a = parse_article(_write(tmp_path, "# 제목\n\n## 요약\nx\n"))
    assert a.fm == {}
    assert a.sections["요약"] == ["x"]
