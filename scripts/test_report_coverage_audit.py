#!/usr/bin/env python3
"""
test_report_coverage_audit.py — report_coverage_audit.py 단위 테스트
표준 라이브러리 unittest만 사용. 작은 인라인 픽스처로 절 분리·토큰·상태 판정 검증.
"""
import unittest
import re
import tempfile
import os
import sys
import csv
from pathlib import Path

# scripts/ 가 sys.path에 있도록
sys.path.insert(0, str(Path(__file__).parent))

import report_coverage_audit as rca


class TestSectionSplit(unittest.TestCase):
    def test_default_pattern_basic(self):
        md = """# 제목

## 01 자원 - 한 해살이 생물
본문1 3,148,876 톤 과 74.4%가 있다.

## 02 어장 - 다섯 곳이 세계를 먹인다
본문2 22.37% 와 FAO 이야기가 있다.

## 03 어법 - 무엇으로 잡느냐가 사업을 가른다
본문3 18.6 톤.
"""
        secs = rca.parse_report_sections(md)
        self.assertEqual(len(secs), 3)
        self.assertEqual(secs[0]['no'], '01')
        self.assertIn('자원', secs[0]['title'])
        self.assertEqual(secs[1]['no'], '02')
        self.assertEqual(secs[2]['no'], '03')

    def test_default_pattern_with_dot(self):
        md = """## 1. 기본세율과 22%의 정체
내용
## 2. 주요 원산지별 2025·2026 협정세율
내용2
"""
        secs = rca.parse_report_sections(md)
        self.assertEqual(len(secs), 2)
        self.assertEqual(secs[0]['no'], '1')
        self.assertEqual(secs[1]['no'], '2')

    def test_default_pattern_je(self):
        md = """## 제1절 서론
내용
## 제2절 본론
내용2
"""
        secs = rca.parse_report_sections(md)
        self.assertEqual(len(secs), 2)
        self.assertEqual(secs[0]['no'], '제1절')
        self.assertEqual(secs[1]['no'], '제2절')

    def test_custom_section_regex(self):
        # 실제 파일에는 "## 범위 — 무엇을 오징어라 부르는가" 처럼 숫자 없는 h2도 있다.
        # 기본 패턴으로는 안 잡히지만 --section-regex 로 열면 잡혀야 한다.
        md = """## 범위 — 무엇을 오징어라 부르는가
내용1
## 02 원인 — 왜 비싸지는가
내용2
## 결론 먼저
내용3
"""
        # 기본은 1개만 잡힌다 (02)
        secs_default = rca.parse_report_sections(md)
        self.assertEqual(len(secs_default), 1)
        self.assertEqual(secs_default[0]['no'], '02')

        # 커스텀: 모든 ## 를 잡는 패턴
        custom = r'^##\s+(?P<title>.+)$'
        secs_custom = rca.parse_report_sections(md, section_regex=custom)
        self.assertEqual(len(secs_custom), 3)
        self.assertIn('범위', secs_custom[0]['title'])
        self.assertIn('결론', secs_custom[2]['title'])

    def test_section_regex_two_groups(self):
        md = """## 09 가공 지역
내용
## 10 가공 업체
내용2
"""
        # 두 그룹(번호, 제목) 패턴
        pat = r'^##\s+(\d+)\s+(.*)$'
        secs = rca.parse_report_sections(md, section_regex=pat)
        self.assertEqual(len(secs), 2)
        self.assertEqual(secs[0]['no'], '09')
        self.assertEqual(secs[0]['title'], '가공 지역')

    def test_html_stripping(self):
        html_text = "<h2>제목</h2><p>3,148,876 톤 과 <b>74.4%</b> 이야기</p><div>FAO</div>"
        stripped = rca.strip_html(html_text)
        self.assertNotIn('<', stripped)
        self.assertIn('3,148,876', stripped)
        self.assertIn('74.4%', stripped)
        self.assertIn('FAO', stripped)

    def test_report_multiple_sections_content_split(self):
        content = """
const STAGE_01: SquidStageNarrative = {
  key: 's01',
  title: '자원',
  paragraphs: ['3,148,876 톤 FAO 이야기'],
};
const STAGE_02: SquidStageNarrative = {
  key: 's02',
  title: '어장',
  paragraphs: ['22.37% 북서태평양'],
};
"""
        stages = rca.parse_stages(content)
        self.assertEqual(len(stages), 2)
        self.assertEqual(stages[0]['key'], 's01')
        self.assertEqual(stages[1]['key'], 's02')
        self.assertIn('s01', stages[0]['block'])
        self.assertIn('s02', stages[1]['block'])


class TestTokenExtraction(unittest.TestCase):
    def test_numeric_tokens_examples(self):
        text = "세계 어획량 3,148,876 톤 과 74.4% 그리고 4.08 달러/kg 와 2024년 자료"
        nums = rca.extract_numeric_tokens(text)
        # 원문 토큰이 포함되는지 확인 (정규화된 형태가 아니라 raw)
        joined = ' '.join(nums)
        self.assertIn('3,148,876', joined)
        self.assertIn('74.4%', joined)
        self.assertIn('4.08', joined)
        self.assertIn('2024', joined)

    def test_numeric_tokens_various_units(self):
        text = "55,747 톤 배분 791척 소진 36.6% 22% 13,568 t 51,074판 3조 4,827억원"
        nums = rca.extract_numeric_tokens(text)
        self.assertTrue(any('55,747' in n for n in nums))
        self.assertTrue(any('36.6%' in n for n in nums))
        self.assertTrue(any('22%' in n for n in nums))

    def test_proper_tokens_korean(self):
        text = "FAO FishStat 오징어 살오징어 북서태평양 FAO"
        props = rca.extract_proper_tokens(text)
        # 한글 2자 이상
        self.assertIn('오징어', props)
        self.assertIn('살오징어', props)
        # 영문 대문자 시작
        self.assertIn('FAO', props)

    def test_proper_tokens_english_acronym(self):
        text = "SPRFMO CMM 18-2026 TAC FAO"
        props = rca.extract_proper_tokens(text)
        self.assertIn('SPRFMO', props)
        self.assertIn('FAO', props)

    def test_normalize_number(self):
        self.assertEqual(rca.normalize_number('3,148,876 톤'), '3148876')
        self.assertEqual(rca.normalize_number('74.4%'), '74.4%')
        self.assertEqual(rca.normalize_number('2024년'), '2024')
        self.assertEqual(rca.normalize_number('4.08 달러/kg'), '4.08')
        # comma 제거 확인
        self.assertEqual(rca.normalize_number('1,367.5원'), '1367.5')

    def test_jaccard(self):
        a = {'오징어', 'FAO', '3,148,876 톤'}
        b = {'오징어', 'FAO', '다른값'}
        j = rca.jaccard(a, b)
        # 교집합 2, 합집합 4 => 0.5
        self.assertAlmostEqual(j, 0.5)
        self.assertEqual(rca.jaccard(set(), set()), 0.0)
        self.assertEqual(rca.jaccard({'a'}, set()), 0.0)

    def test_jaccard_identical(self):
        s = {'A', 'B', 'C'}
        self.assertAlmostEqual(rca.jaccard(s, s), 1.0)


class TestStatusDecision(unittest.TestCase):
    def test_status_thresholds(self):
        self.assertEqual(rca.status_from_jaccard(0.40), 'covered')
        self.assertEqual(rca.status_from_jaccard(0.35), 'covered')
        self.assertEqual(rca.status_from_jaccard(0.34), 'partial')
        self.assertEqual(rca.status_from_jaccard(0.15), 'partial')
        self.assertEqual(rca.status_from_jaccard(0.149), 'missing')
        self.assertEqual(rca.status_from_jaccard(0.0), 'missing')

    def test_integration_jaccard_and_status(self):
        # 작은 픽스처로 전체 흐름 검증
        report_md = """## 01 자원
오징어 FAO 3,148,876 톤 32.6 톤 양식 통계

## 02 어장
북서태평양 22.37% 중국 30.41% 어획 상위국
"""
        content_ts = """
const S1: X = { key: 's01', title: '자원', paragraphs: ['오징어 FAO 3,148,876 톤 양식 32.6 톤'] };
const S2: X = { key: 's02', title: '어장', paragraphs: ['북서태평양 22.37% 중국 30.41%'] };
"""
        secs = rca.parse_report_sections(report_md)
        stages = rca.parse_stages(content_ts)
        self.assertEqual(len(secs), 2)
        self.assertEqual(len(stages), 2)
        # 절마다 토큰 합집합
        for sec in secs:
            sec_toks = rca.extract_all_tokens(sec['title'] + '\n' + sec['body'])
            best_j = 0
            for st in stages:
                st_toks = rca.extract_all_tokens(st['block'])
                j = rca.jaccard(sec_toks, st_toks)
                if j > best_j:
                    best_j = j
            # 두 절 모두 어휘가 겹치므로 partial 이상 기대
            self.assertGreaterEqual(best_j, 0.15)

    def test_missing_numbers_logic(self):
        # 보고서에만 있는 수치 vs 페이지에도 있는 수치
        report_text = "보고서 수치 9,999,999 톤 과 3,148,876 톤"
        content_text = "페이지 수치 3,148,876 톤 만 있음"
        report_nums = rca.extract_numeric_tokens(report_text)
        content_nums = rca.extract_numeric_tokens(content_text)
        content_norm = set(rca.normalize_number(n) for n in content_nums)
        missing = []
        for tok in report_nums:
            if rca.normalize_number(tok) not in content_norm:
                missing.append(tok)
        # 9,999,999 는 missing, 3,148,876 은 not missing
        self.assertTrue(any('9,999,999' in m for m in missing))
        self.assertFalse(any('3,148,876' in m for m in missing))

    def test_missing_numbers_with_units_normalized(self):
        # 181,408 톤 vs 181,408 t 는 같은 수치로 보아 missing 아님
        report_nums = rca.extract_numeric_tokens("181,408 톤")
        content_nums = rca.extract_numeric_tokens("181,408 t")
        content_norm = set(rca.normalize_number(n) for n in content_nums)
        missing = [t for t in report_nums if rca.normalize_number(t) not in content_norm]
        self.assertEqual(len(missing), 0)


class TestEndToEndCSV(unittest.TestCase):
    def test_csv_generation(self):
        with tempfile.TemporaryDirectory() as td:
            report_path = Path(td) / 'rep.md'
            content_path = Path(td) / 'content.ts'
            out_path = Path(td) / 'out.csv'
            report_path.write_text(
                "## 01 자원\n오징어 3,148,876 톤 FAO 2024년\n\n## 02 어장\n북서태평양 22.37% 중국 30.41%\n",
                encoding='utf-8',
            )
            content_path.write_text(
                "const A={key:'s01', paragraphs:['오징어 3,148,876 톤 FAO 2024년']};\nconst B={key:'s02', paragraphs:['북서태평양 22.37% 중국 30.41%']};",
                encoding='utf-8',
            )
            # 직접 함수 호출 대신 CLI 시뮬레이션: parse + write
            text = report_path.read_text(encoding='utf-8')
            secs = rca.parse_report_sections(text)
            stages = rca.parse_stages(content_path.read_text(encoding='utf-8'))
            # 간단히 CSV 작성 로직 점검
            self.assertEqual(len(secs), 2)
            self.assertEqual(len(stages), 2)
            # 실제 스크립트 실행을 통해 CSV 생성 확인
            import subprocess
            cmd = [
                sys.executable,
                str(Path(__file__).parent / 'report_coverage_audit.py'),
                '--commodity', 'squid',
                '--report', str(report_path),
                '--content', str(content_path),
                '--out', str(out_path),
                '--summary',
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, msg=result.stderr)
            self.assertTrue(out_path.exists())
            with out_path.open(encoding='utf-8') as f:
                reader = csv.DictReader(f)
                self.assertEqual(reader.fieldnames, ['commodity','section_no','section_title','best_stage_key','jaccard','report_numbers','missing_numbers_count','missing_numbers_sample','status'])
                rows = list(reader)
                self.assertEqual(len(rows), 2)
                for r in rows:
                    self.assertIn(r['status'], ('covered','partial','missing'))
                    self.assertIn(r['best_stage_key'], ('s01','s02'))
            # summary 출력 확인
            self.assertIn('squid:', result.stdout)
            self.assertIn('sections', result.stdout)


if __name__ == '__main__':
    unittest.main()
