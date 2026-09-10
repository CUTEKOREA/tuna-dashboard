#!/usr/bin/env python3
"""
report_coverage_audit.py — 보고서 ↔ 대시보드 페이지 커버리지 감사

순수 파이썬·표준 라이브러리만 사용.
보고서 마크다운(또는 html) 의 절과 lib/<종>-industry-content.ts 의 단계 블록을
수치/고유명사 토큰으로 대조해 절별 커버리지 CSV를 만든다.

스펙: 발주서 B (spec_coverage_audit.md)
출력 CSV 열:
  commodity,section_no,section_title,best_stage_key,jaccard,report_numbers,missing_numbers_count,missing_numbers_sample,status
status: covered >=0.35 / partial 0.15~0.35 / missing <0.15
"""
from __future__ import annotations

import argparse
import csv
import html as html_lib
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# 토큰 추출
# ---------------------------------------------------------------------------

# 수치 토큰: 예 3,148,876 / 74.4% / 4.08 달러/kg / 2024년 / 55,747 톤 / 13,568 t / 22%
# - 숫자는 쉼표 포함, 소수 포함
# - 뒤에 붙는 단위는 선택적이며 공백 유무 모두 허용
# - 단위는 스펙 예시와 실제 squid 데이터에서 관측된 것들을 포함
_NUM_SUFFIX = r'(?:%|년|월|일|톤|kg|g|원/kg|원/마리|달러/kg|달러/톤|USD/kg|USD|원|달러|t\b|판|척|곳|명|건|억\s*원|만\s*톤|천\s*톤|조\s*원|억|만|천|위|배|조|회)'
# 숫자는 쉼표 포함(그룹 필수) 또는 일반 숫자 — 4자리 연도(2024년)가 202/4년으로 쪼개지지 않도록 그룹은 + 로
NUM_PATTERN = re.compile(
    rf'\d{{1,3}}(?:,\d{{3}})+(?:\.\d+)?\s*{_NUM_SUFFIX}?'
    rf'|\d+(?:\.\d+)?\s*{_NUM_SUFFIX}?',
    re.UNICODE,
)
# 별도: 퍼센트는 위에서도 잡히지만 확실히
# 후처리에서 중복 정리

KOR_PATTERN = re.compile(r'[가-힣]{2,}')
ENG_PATTERN = re.compile(r'\b[A-Z][A-Za-z]{1,}\b|\b[A-Z]{2,}\b')

# 괄호/따옴표 안 이름도 별도 추출하되, 사실 위 패턴으로 이미 잡히므로
# 참고용으로만 둔다. 필요하면 phrase 단위도 토큰에 넣는다.
QUOTE_PATTERNS = [
    re.compile(r'「([^」]+)」'),
    re.compile(r'"([^"]+)"'),
    re.compile(r'“([^”]+)”'),
    re.compile(r"'([^']+)'"),
    re.compile(r'\(([^)]+)\)'),
]


def strip_html(text: str) -> str:
    """html이면 태그 제거 + entity decode"""
    # h2 제목은 마크다운 절 머리(## ...)로 바꿔 절 분리가 되게 한다. 내부 태그(span 등)는 지운다.
    def _h2(m: re.Match) -> str:
        inner = re.sub(r'<[^>]+>', ' ', m.group(1))
        inner = re.sub(r'[ \t]+', ' ', html_lib.unescape(inner)).strip()
        return f"\n## {inner}\n"
    text = re.sub(r'<h2\b[^>]*>(.*?)</h2>', _h2, text, flags=re.S | re.I)
    # 블록 경계는 줄바꿈으로 남긴다(p·li·tr·div 가 붙으면 한 줄로 뭉친다)
    text = re.sub(r'</(p|li|tr|div|h[1-6]|section|table)>', '\n', text, flags=re.I)
    # 태그 제거
    no_tag = re.sub(r'<[^>]+>', ' ', text)
    # entity decode
    decoded = html_lib.unescape(no_tag)
    # 연속 공백 정리
    decoded = re.sub(r'[ \t]+', ' ', decoded)
    return decoded


def extract_numeric_tokens(text: str) -> list[str]:
    """텍스트에서 수치 토큰을 순서대로 추출 (중복 포함, 정규화 전)."""
    tokens: list[str] = []
    for m in NUM_PATTERN.finditer(text):
        raw = m.group(0).strip()
        # 너무 짧은 단일 숫자(예: 1, 2)는 노이즈 — 단위가 없으면 2자리 이상이거나 쉼표/소수/%/년 포함일 때만
        # 단, 연도(2024년)처럼 단위가 붙은 1자리도 허용되므로 suffix가 있으면 유지
        # 여기서는 raw 길이가 1이고 아무 suffix 없으면 제외
        core_digits = re.sub(r'[^\d]', '', raw)
        if len(core_digits) == 1 and not re.search(r'(%|년|톤|kg|원|달러|판|척|곳|t\b)', raw):
            # 한 자리 숫자는 단위가 없으면 버린다 (노이즈)
            continue
        # 빈 문자열, 혹은 숫자가 아닌 것 제외
        if not re.search(r'\d', raw):
            continue
        # 너무 짧고 단위 없는 1~2자리 숫자도 노이즈일 수 있으나, 스펙 예시 2024년은 4자리이므로 유지
        # 최종적으로 raw가 숫자를 포함하면 채택
        # 후처리: 앞뒤 공백 정리, 내부 다중 공백은 하나로
        raw = re.sub(r'\s+', ' ', raw).strip()
        # 토큰이 단독 쉼표 등으로 끝나지 않으면 추가
        if raw:
            tokens.append(raw)
    return tokens


def extract_proper_tokens(text: str) -> list[str]:
    """고유명사 토큰: 2자 이상 한글, 영문 대문자 시작 단어, 따옴표/괄호 안도 포함."""
    tokens: list[str] = []
    # 한글
    tokens.extend(KOR_PATTERN.findall(text))
    # 영문
    tokens.extend(ENG_PATTERN.findall(text))
    # 따옴표/괄호 안 phrase에서 다시 한글/영문 추출 (중복되더라도 set에서 정리되므로 추가)
    # phrase 자체를 하나의 토큰으로 넣지는 않고, phrase 안의 한글/영문만 이미 위에서 잡히므로 생략 가능
    # 다만 phrase 전체를 토큰으로 넣으면 자카드가 더 민감해지므로 넣지 않는다.
    return tokens


def extract_all_tokens(text: str) -> set[str]:
    """수치+고유명사 합집합 (자카드 계산용)."""
    nums = extract_numeric_tokens(text)
    props = extract_proper_tokens(text)
    # 자카드에서는 문자열 그대로를 쓰되, 수치는 normalize 없이 원문 사용 (중복 제거)
    combined = set(nums) | set(props)
    # 너무 흔한 불용어는 제거하지 않는다 — 스펙에 없음
    return combined


def normalize_number(tok: str) -> str:
    """수치 토큰을 비교용으로 정규화: 쉼표·공백 제거, 숫자+%/소수만 남김.
    181,408 톤 / 181,408 t -> 동일하게 181408 으로 매칭되도록.
    74.4% -> 74.4% (퍼센트 유지)
    2024년 -> 2024 (년 제거 후 숫자만)
    """
    # 퍼센트 여부
    has_percent = '%' in tok
    # 숫자 코어 추출 (쉼표 포함)
    m = re.search(r'[\d,]+\.?\d*', tok)
    if m:
        core = m.group(0).replace(',', '').strip()
        if has_percent:
            core = core.rstrip('%') + '%'
            if not core.endswith('%'):
                core += '%'
        return core
    # fallback
    return tok.replace(',', '').replace(' ', '').strip()


# ---------------------------------------------------------------------------
# 보고서 파싱
# ---------------------------------------------------------------------------

DEFAULT_SECTION_RE = r'^##\s*(?P<no>\d{1,2}\.?|제\d+절)(?:\s+(?P<title>.*))?$'

def parse_report_sections(text: str, section_regex: str | None = None) -> list[dict]:
    """
    보고서 텍스트를 절 단위로 나눈다.
    section_regex가 주어지면 그 패턴으로 h2를 찾는다.
    반환: [{no, title, body, raw_heading, start_line}, ...]
    """
    pattern_str = section_regex if section_regex else DEFAULT_SECTION_RE
    try:
        pat = re.compile(pattern_str, re.MULTILINE)
    except re.error as e:
        print(f"[error] --section-regex 패턴 오류: {e}", file=sys.stderr)
        sys.exit(2)

    # 패턴이 ^## 를 포함하지 않으면 자동으로 ## 라인만 대상으로 함을 경고
    # (스펙과 다른 파일을 열어두기 위해 유연하게 둠)
    headings: list[re.Match] = list(pat.finditer(text))
    # 만약 기본 패턴으로 0개이고 커스텀 없이 호출됐다면, 경고
    if not headings and section_regex is None:
        # 스펙과 실제 형식이 어긋났을 수 있음 — 보고하되 진행
        print(
            "[warn] 기본 절 패턴으로 매칭된 절이 없습니다. "
            "실제 파일 형식이 스펙(## NN / ## NN. / ## 제N절)과 다를 수 있습니다. "
            "--section-regex 로 패턴을 지정해 다시 시도하세요.",
            file=sys.stderr,
        )
        return []

    # 패턴이 그룹을 전혀 갖지 않으면 전체 매치를 제목으로 쓴다
    # 그룹 처리
    has_no = 'no' in pat.groupindex
    has_title = 'title' in pat.groupindex
    num_groups = pat.groups  # 캡처 그룹 수

    sections: list[dict] = []
    for idx, m in enumerate(headings):
        # 다음 heading 시작 전까지가 본문
        start = m.end()
        end = headings[idx + 1].start() if idx + 1 < len(headings) else len(text)
        body = text[start:end]

        # no/title 추출
        if has_no and has_title:
            no = (m.group('no') or '').strip()
            title = (m.group('title') or '').strip()
        elif has_no and not has_title:
            # no만 있고 title 없음 -> 그룹 1이 no, 나머지는 매치 전체에서 분리
            try:
                no = (m.group('no') or '').strip()
            except IndexError:
                no = ''
            # title은 매치 전체에서 no 부분 제거
            full = m.group(0)
            title = full.replace(no, '', 1).lstrip('#').strip()
        elif not has_no and has_title:
            try:
                title = (m.group('title') or '').strip()
            except IndexError:
                title = m.group(0).lstrip('#').strip()
            no = str(idx + 1).zfill(2)
        else:
            # 이름 없는 그룹
            if num_groups >= 2:
                no = (m.group(1) or '').strip()
                title = (m.group(2) or '').strip()
            elif num_groups == 1:
                # 하나의 캡처 그룹이 제목
                title = (m.group(1) or '').strip()
                # no는 순번
                no = str(idx + 1).zfill(2)
            else:
                # 그룹 없음 -> 전체 매치에서 ## 제거
                raw = m.group(0)
                title = re.sub(r'^##\s*', '', raw).strip()
                no = str(idx + 1).zfill(2)

        # no 정규화: "02.", "02" -> "02"
        no_clean = re.sub(r'\.$', '', no).strip()
        # title에서 선행 공백/기호 정리
        title_clean = title.strip()
        # 빈 제목이면 heading 원문에서 추출
        if not title_clean:
            title_clean = re.sub(r'^##\s*', '', m.group(0)).strip()

        sections.append({
            'no': no_clean,
            'title': title_clean,
            'body': body,
            'raw_heading': m.group(0),
            'heading_start': m.start(),
        })
    return sections


def parse_stages(content_text: str) -> list[dict]:
    """content.ts 에서 key: 's01' 블록으로 나눈다."""
    key_pat = re.compile(r"key:\s*'(?P<key>[^']+)'")
    matches = list(key_pat.finditer(content_text))
    if not matches:
        print("[warn] content.ts 에서 key: '...' 패턴을 찾지 못했습니다.", file=sys.stderr)
        return []
    stages: list[dict] = []
    for i, m in enumerate(matches):
        key = m.group('key')
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(content_text)
        block = content_text[start:end]
        stages.append({
            'key': key,
            'block': block,
            'start': start,
        })
    return stages


def jaccard(a: set[str], b: set[str]) -> float:
    if not a and not b:
        return 0.0
    if not a or not b:
        return 0.0
    inter = len(a & b)
    union = len(a | b)
    return inter / union if union else 0.0


def status_from_jaccard(j: float) -> str:
    if j >= 0.35:
        return 'covered'
    elif j >= 0.15:
        return 'partial'
    else:
        return 'missing'


# ---------------------------------------------------------------------------
# 메인
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description='보고서 ↔ 대시보드 페이지 커버리지 감사 CSV 생성',
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument('--report', action='append', required=True, help='보고서 마크다운 경로 (여러 번 가능; .html이면 태그 제거)')
    parser.add_argument('--content', required=True, help='lib/<종>-industry-content.ts 경로')
    parser.add_argument('--out', required=True, help='출력 CSV 경로')
    parser.add_argument('--commodity', required=True, help='품목 이름 (예: squid)')
    parser.add_argument('--summary', action='store_true', help='표준출력에 절 수·covered/partial/missing 개수 한 줄')
    parser.add_argument('--section-regex', dest='section_regex', default=None, help='절 제목을 찾기 위한 정규식 (기본: ^##\\s*(\\d{1,2}\\.?|제\\d+절)\\b). --section-regex 로 열어 둠')

    args = parser.parse_args()

    # 1) 보고서 읽기 (여러 번 가능 => 합치기, 파일은 한 번만 읽기)
    report_texts: list[str] = []
    for rp in args.report:
        p = Path(rp)
        if not p.exists():
            print(f"[error] 보고서 파일을 찾을 수 없습니다: {rp}", file=sys.stderr)
            sys.exit(2)
        # 스펙: Google Drive 경로는 첫 읽기가 느리다. 파일을 한 번만 읽어라.
        text = p.read_text(encoding='utf-8', errors='ignore')
        # .html이면 태그 제거
        if p.suffix.lower() == '.html':
            text = strip_html(text)
        report_texts.append(text)

    combined_report = '\n'.join(report_texts)

    sections = parse_report_sections(combined_report, args.section_regex)

    # 스펙과 실제 형식 불일치 보고 — 실제 파일에는 숫자 없는 h2도 있음
    # 기본 패턴으로 잡히지 않은 h2를 stderr로 보고하되 고치지 않음
    if args.section_regex is None:
        all_h2 = re.findall(r'^##\s.*', combined_report, re.MULTILINE)
        if len(all_h2) != len(sections):
            skipped = len(all_h2) - len(sections)
            print(
                f"[warn] 보고서 h2 총 {len(all_h2)}개 중 기본 패턴으로 {len(sections)}개만 파싱됨 "
                f"({skipped}개 스킵). 스킵된 예: {', '.join([h[:40] for h in all_h2 if not re.match(DEFAULT_SECTION_RE, h)][ :3])} ... "
                f"--section-regex 로 패턴을 열어 다시 시도하세요.",
                file=sys.stderr,
            )

    # 2) content 읽기
    content_path = Path(args.content)
    if not content_path.exists():
        print(f"[error] content 파일을 찾을 수 없습니다: {args.content}", file=sys.stderr)
        sys.exit(2)
    content_text = content_path.read_text(encoding='utf-8', errors='ignore')
    stages = parse_stages(content_text)

    # 3) 토큰 추출 및 매칭
    # 스테이지별 토큰
    stage_tokens: dict[str, set[str]] = {}
    stage_numeric_sets: dict[str, set[str]] = {}
    stage_numeric_norm_sets: dict[str, set[str]] = {}
    for st in stages:
        block = st['block']
        nums = extract_numeric_tokens(block)
        props = extract_proper_tokens(block)
        tok_set = set(nums) | set(props)
        stage_tokens[st['key']] = tok_set
        stage_numeric_sets[st['key']] = set(nums)
        stage_numeric_norm_sets[st['key']] = set(normalize_number(n) for n in nums)

    # 전체 content 수치의 정규화 집합 (missing 판정용 — 페이지 어디에도 없는 것)
    global_content_numeric_norm: set[str] = set()
    for s in stage_numeric_norm_sets.values():
        global_content_numeric_norm |= s
    # 원문 수치 집합도 유지 (디버그용)
    global_content_numeric_raw: set[str] = set()
    for s in stage_numeric_sets.values():
        global_content_numeric_raw |= s

    # 섹션별 계산
    rows: list[dict] = []
    for sec in sections:
        sec_text = sec['title'] + '\n' + sec['body']
        sec_nums_raw = extract_numeric_tokens(sec_text)
        sec_nums_set = set(sec_nums_raw)
        sec_nums_norm = set(normalize_number(n) for n in sec_nums_set)
        sec_props = set(extract_proper_tokens(sec_text))
        sec_tok_set = sec_nums_set | sec_props

        # 자카드: 가장 겹치는 단계
        best_key = ''
        best_j = 0.0
        if stage_tokens:
            for k, st_set in stage_tokens.items():
                j = jaccard(sec_tok_set, st_set)
                if j > best_j:
                    best_j = j
                    best_key = k
            # 동점이면 처음 것이 유지 ( > 로 비교하므로)
        # 라운드: 4자리
        jaccard_val = round(best_j, 4)

        # missing: 보고서 절의 수치 중 페이지 어디에도 없는 것
        missing_raw: list[str] = []
        # sec_nums_raw의 등장 순서를 유지하되 중복 제거
        seen = set()
        for tok in sec_nums_raw:
            if tok in seen:
                continue
            seen.add(tok)
            norm = normalize_number(tok)
            if norm not in global_content_numeric_norm and tok not in global_content_numeric_raw:
                # 정규화와 원문 둘 다 없으면 missing
                missing_raw.append(tok)
            elif norm not in global_content_numeric_norm and norm != tok:
                # 정규화가 없으면 missing (원문이 달라도 정규화 기준)
                # 이미 위에서 원문 체크했으므로, 정규화 기준만 다시 확인
                # 원문이 없으면 위에서 걸렸으므로 여기서는 정규화만 보면 됨
                pass

        # 위 로직에서 누락된 것을 다시 정확히: sec_nums_set 중 global에 없는 것
        # 등장 순서대로 최대 8개
        missing_ordered: list[str] = []
        seen2: set[str] = set()
        for tok in sec_nums_raw:
            if tok in seen2:
                continue
            seen2.add(tok)
            norm = normalize_number(tok)
            if norm not in global_content_numeric_norm and tok not in global_content_numeric_raw:
                missing_ordered.append(tok)

        report_numbers = len(sec_nums_set)
        missing_count = len(missing_ordered)
        missing_sample = '; '.join(missing_ordered[:8])
        status = status_from_jaccard(best_j)

        rows.append({
            'commodity': args.commodity,
            'section_no': sec['no'],
            'section_title': sec['title'],
            'best_stage_key': best_key,
            'jaccard': f"{jaccard_val:.4f}",
            'report_numbers': str(report_numbers),
            'missing_numbers_count': str(missing_count),
            'missing_numbers_sample': missing_sample,
            'status': status,
        })

    # 4) CSV 출력
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = ['commodity','section_no','section_title','best_stage_key','jaccard','report_numbers','missing_numbers_count','missing_numbers_sample','status']
    with out_path.open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        for r in rows:
            writer.writerow(r)

    # 5) summary
    if args.summary:
        total = len(rows)
        covered = sum(1 for r in rows if r['status'] == 'covered')
        partial = sum(1 for r in rows if r['status'] == 'partial')
        missing = sum(1 for r in rows if r['status'] == 'missing')
        # 절 수·covered/partial/missing 개수 한 줄
        print(f"{args.commodity}: {total} sections — covered {covered} partial {partial} missing {missing}")
        if total < 10:
            print(f"[warn] 절 수가 10 미만입니다 ({total}). 보고서 파싱 패턴을 확인하세요. --section-regex 로 조정 가능합니다.", file=sys.stderr)

    # 스펙과 실제 형식 불일치 보고 (이미 위에서 warn 출력)
    # 추가로 정보성 출력 (stderr)
    if not sections:
        print("[error] 파싱된 절이 0개입니다. CSV는 헤더만 생성되었습니다.", file=sys.stderr)
    elif not stages:
        print("[error] 파싱된 스테이지가 0개입니다.", file=sys.stderr)


if __name__ == '__main__':
    main()
