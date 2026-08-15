#!/usr/bin/env python3
"""위젯의 상위 16개 하드코딩 hex 색을 CSS 브리지 토큰으로 치환한다."""

from __future__ import annotations

import argparse
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path


COLOR_TOKENS = {
  '#94a3b8': 'var(--w-slate-400)',
  '#64748b': 'var(--w-slate-500)',
  '#10b981': 'var(--w-emerald-500)',
  '#f59e0b': 'var(--w-amber-500)',
  '#ef4444': 'var(--w-red-500)',
  '#38bdf8': 'var(--w-sky-400)',
  '#e2e8f0': 'var(--w-slate-200)',
  '#f8fafc': 'var(--w-slate-50)',
  '#8b5cf6': 'var(--w-violet-500)',
  '#cbd5e1': 'var(--w-slate-300)',
  '#3b82f6': 'var(--w-blue-500)',
  '#fbbf24': 'var(--w-amber-400)',
  '#1a2442': 'var(--w-navy-900)',
  '#ec4899': 'var(--w-pink-500)',
  '#06b6d4': 'var(--w-cyan-500)',
  '#34d399': 'var(--w-emerald-400)',
}

TARGET_RGB = {
  tuple(int(color[index:index + 2], 16) for index in (1, 3, 5))
  for color in COLOR_TOKENS
}

HEX_RE = re.compile(r'#[0-9a-fA-F]{6}(?![0-9a-fA-F])')
RGBA_RE = re.compile(
  r'rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,'
  r'\s*(?:\d*\.?\d+|\d+%)\s*\)',
  re.IGNORECASE,
)
STYLE_PROPERTY_RE = re.compile(
  r'(?<![\w-])('
  r'color|background(?:[A-Z][A-Za-z]*)?|background(?:-[\w-]+)?|'
  r'border(?:[A-Z][A-Za-z]*)?|border(?:-[\w-]+)?|'
  r'stroke|fill|stopColor|boxShadow|box-shadow'
  r')\s*:'
)
JSX_ATTRIBUTE_RE = re.compile(r'(?<![\w-])(stroke|fill|stopColor)\s*=')
JSX_STYLE_CONTAINER_RE = re.compile(
  r'(?<![\w-])('
  r'style|[A-Za-z_$][\w$]*Style|tick|label|dot|activeDot|cursor'
  r')\s*=\s*{'
)
STYLE_VARIABLE_RE = re.compile(
  r'\b(?:const|let|var)\s+[A-Za-z_$][\w$]*(?:Style|Styles|styles)\b'
  r'\s*(?::[^=;\n]+)?=\s*{'
)
CSS_PROPERTIES_RE = re.compile(
  r'\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*:'
  r'\s*(?:React\.)?CSSProperties\s*=\s*{'
)
TEST_NAME_RE = re.compile(r'(?:^|\.)(?:test|spec)\.[^.]+$')
EXCLUDED_DIRECTORIES = {'v2', 'cosmo'}


@dataclass(frozen=True)
class Replacement:
  start: int
  end: int
  token: str


@dataclass
class FileResult:
  path: Path
  original: str
  updated: str
  replacements: int


def mask_comments(source: str) -> str:
  """문자열 길이와 개행을 보존하면서 JS/CSS 주석만 공백 처리한다."""
  chars = list(source)
  index = 0
  quote: str | None = None
  escaped = False

  while index < len(source):
    char = source[index]
    next_char = source[index + 1] if index + 1 < len(source) else ''

    if quote is not None:
      if escaped:
        escaped = False
      elif char == '\\':
        escaped = True
      elif char == quote:
        quote = None
      elif quote == '`' and char == '/' and next_char == '*':
        end = source.find('*/', index + 2)
        end = len(source) - 2 if end == -1 else end
        for cursor in range(index, min(end + 2, len(source))):
          if chars[cursor] != '\n':
            chars[cursor] = ' '
        index = end + 2
        continue
      index += 1
      continue

    if char in {'\'', '"', '`'}:
      quote = char
      index += 1
      continue

    if char == '/' and next_char == '/':
      end = source.find('\n', index + 2)
      end = len(source) if end == -1 else end
      for cursor in range(index, end):
        chars[cursor] = ' '
      index = end
      continue

    if char == '/' and next_char == '*':
      end = source.find('*/', index + 2)
      end = len(source) - 2 if end == -1 else end
      for cursor in range(index, min(end + 2, len(source))):
        if chars[cursor] != '\n':
          chars[cursor] = ' '
      index = end + 2
      continue

    index += 1

  return ''.join(chars)


def is_test_file(path: Path) -> bool:
  return '__tests__' in path.parts or TEST_NAME_RE.search(path.name) is not None


def is_excluded_directory(relative_path: Path) -> bool:
  return bool(EXCLUDED_DIRECTORIES.intersection(relative_path.parts[:-1]))


def has_unclosed_brace(value_prefix: str) -> bool:
  depth = 0
  quote: str | None = None
  escaped = False
  for char in value_prefix:
    if quote is not None:
      if escaped:
        escaped = False
      elif char == '\\':
        escaped = True
      elif char == quote:
        quote = None
      continue
    if char in {'\'', '"', '`'}:
      quote = char
    elif char == '{':
      depth += 1
    elif char == '}':
      depth -= 1
      if depth == 0:
        return False
  return depth > 0


def property_value_is_active(value_prefix: str) -> bool:
  quote: str | None = None
  escaped = False
  paren_depth = 0
  bracket_depth = 0
  brace_depth = 0

  for char in value_prefix:
    if quote is not None:
      if escaped:
        escaped = False
      elif char == '\\':
        escaped = True
      elif char == quote:
        quote = None
      continue
    if char in {'\'', '"', '`'}:
      quote = char
    elif char == '(':
      paren_depth += 1
    elif char == ')':
      if paren_depth == 0:
        return False
      paren_depth -= 1
    elif char == '[':
      bracket_depth += 1
    elif char == ']':
      if bracket_depth == 0:
        return False
      bracket_depth -= 1
    elif char == '{':
      brace_depth += 1
    elif char == '}':
      if brace_depth == 0:
        return False
      brace_depth -= 1
    elif char in {',', ';'} and not (paren_depth or bracket_depth or brace_depth):
      return False
  return True


def open_container_before(
  masked: str,
  position: int,
  pattern: re.Pattern[str],
) -> bool:
  window_start = max(0, position - 8000)
  prefix = masked[window_start:position]
  for match in reversed(list(pattern.finditer(prefix))):
    if has_unclosed_brace(prefix[match.end() - 1:]):
      return True
  return False


def css_context_contains(masked: str, position: int) -> bool:
  window_start = max(0, position - 8000)
  prefix = masked[window_start:position]
  style_opens = list(re.finditer(r'<style(?:\s|>)', prefix))
  last_open = style_opens[-1].start() if style_opens else -1
  return last_open > prefix.rfind('</style>')


def style_container_contains(masked: str, position: int) -> bool:
  return (
    css_context_contains(masked, position)
    or open_container_before(masked, position, JSX_STYLE_CONTAINER_RE)
    or open_container_before(masked, position, STYLE_VARIABLE_RE)
    or open_container_before(masked, position, CSS_PROPERTIES_RE)
  )


def jsx_attribute_contains(masked: str, start: int) -> bool:
  window_start = max(0, start - 4000)
  prefix = masked[window_start:start]
  matches = list(JSX_ATTRIBUTE_RE.finditer(prefix))
  if not matches:
    return False

  value_prefix = prefix[matches[-1].end():].lstrip()
  if not value_prefix:
    return False

  if value_prefix[0] in {'\'', '"', '`'}:
    quote = value_prefix[0]
    escaped = False
    for char in value_prefix[1:]:
      if escaped:
        escaped = False
      elif char == '\\':
        escaped = True
      elif char == quote:
        return False
    return True

  if value_prefix[0] == '{':
    return has_unclosed_brace(value_prefix)

  return False


def style_property_contains(masked: str, start: int) -> bool:
  window_start = max(0, start - 4000)
  prefix = masked[window_start:start]
  matches = list(STYLE_PROPERTY_RE.finditer(prefix))
  if not matches:
    return False

  last_style = matches[-1]
  property_position = window_start + last_style.start()
  return (
    property_value_is_active(prefix[last_style.end():])
    and style_container_contains(masked, property_position)
  )


def count_target_literals(source: str) -> int:
  masked = mask_comments(source)
  count = sum(
    1
    for match in HEX_RE.finditer(masked)
    if match.group(0).lower() in COLOR_TOKENS
  )
  count += sum(
    1
    for match in RGBA_RE.finditer(masked)
    if tuple(int(match.group(index)) for index in (1, 2, 3)) in TARGET_RGB
  )
  return count


def transform_source(source: str) -> tuple[str, int, Counter[str]]:
  masked = mask_comments(source)
  replacements: list[Replacement] = []
  skipped: Counter[str] = Counter()

  for match in HEX_RE.finditer(source):
    color = match.group(0).lower()
    if color not in COLOR_TOKENS:
      continue
    if masked[match.start():match.end()] != match.group(0):
      skipped['주석'] += 1
      continue
    if not (
      jsx_attribute_contains(masked, match.start())
      or style_property_contains(masked, match.start())
    ):
      skipped['비스타일/의미값'] += 1
      continue
    replacements.append(
      Replacement(match.start(), match.end(), COLOR_TOKENS[color])
    )

  for match in RGBA_RE.finditer(source):
    if masked[match.start():match.end()] != match.group(0):
      continue
    rgb = tuple(int(match.group(index)) for index in (1, 2, 3))
    if rgb in TARGET_RGB:
      skipped['알파 포함 rgba'] += 1

  updated = source
  for replacement in reversed(replacements):
    updated = (
      updated[:replacement.start]
      + replacement.token
      + updated[replacement.end:]
    )

  if replacements:
    replaced_lines = {
      source.count('\n', 0, replacement.start)
      for replacement in replacements
    }
    lines = updated.splitlines(keepends=True)
    for line_index in replaced_lines:
      line = lines[line_index]
      if line.endswith('\r\n'):
        lines[line_index] = line[:-2].rstrip(' \t') + '\r\n'
      elif line.endswith('\n'):
        lines[line_index] = line[:-1].rstrip(' \t') + '\n'
      else:
        lines[line_index] = line.rstrip(' \t')
    updated = ''.join(lines)

  return updated, len(replacements), skipped


def build_samples(results: list[FileResult], root: Path) -> list[str]:
  samples: list[str] = []
  for result in results:
    original_lines = result.original.splitlines()
    updated_lines = result.updated.splitlines()
    for line_number, (before, after) in enumerate(
      zip(original_lines, updated_lines, strict=True),
      start=1,
    ):
      if before == after:
        continue
      relative = result.path.relative_to(root)
      samples.append(
        f'### {len(samples) + 1}. `{relative}:{line_number}`\n\n'
        f'```diff\n-{before}\n+{after}\n```'
      )
      if len(samples) == 20:
        return samples
  return samples


def render_report(
  results: list[FileResult],
  skipped: Counter[str],
  root: Path,
  dry_run: bool,
) -> str:
  total = sum(result.replacements for result in results)
  mode = 'DRY-RUN' if dry_run else 'APPLY'
  lines = [
    f'# L-07 위젯 색상 치환 {mode}',
    '',
    f'- 총 치환 수: {total}',
    f'- 변경 파일 수: {len(results)}',
    '',
    '## 파일별 치환 예정 건수' if dry_run else '## 파일별 치환 건수',
    '',
    '| 파일 | 건수 |',
    '| --- | ---: |',
  ]
  lines.extend(
    f'| `{result.path.relative_to(root)}` | {result.replacements} |'
    for result in results
  )
  if not results:
    lines.append('| 해당 없음 | 0 |')

  lines.extend(['', '## 스킵 사유', ''])
  for reason in (
    '알파 포함 rgba',
    '비스타일/의미값',
    '주석',
    '제외 디렉터리(v2/cosmo)',
    '테스트 파일',
  ):
    lines.append(f'- {reason}: {skipped[reason]}')

  samples = build_samples(results, root)
  lines.extend(['', f'## 샘플 diff {len(samples)}개', ''])
  lines.extend(samples or ['변경 샘플 없음'])
  return '\n'.join(lines) + '\n'


def run(root: Path, dry_run: bool) -> tuple[str, int]:
  components = root / 'components'
  if not components.is_dir():
    raise FileNotFoundError(f'components 디렉터리를 찾을 수 없습니다: {components}')

  results: list[FileResult] = []
  skipped: Counter[str] = Counter()
  for path in sorted(components.rglob('*.tsx')):
    relative = path.relative_to(components)
    source = path.read_text(encoding='utf-8')
    if is_excluded_directory(relative):
      skipped['제외 디렉터리(v2/cosmo)'] += count_target_literals(source)
      continue
    if is_test_file(relative):
      skipped['테스트 파일'] += count_target_literals(source)
      continue

    updated, count, file_skips = transform_source(source)
    skipped.update(file_skips)
    if count == 0:
      continue
    results.append(FileResult(path, source, updated, count))
    if not dry_run:
      path.write_text(updated, encoding='utf-8')

  return render_report(results, skipped, root, dry_run), sum(
    result.replacements for result in results
  )


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(description=__doc__)
  mode = parser.add_mutually_exclusive_group(required=True)
  mode.add_argument('--dry-run', action='store_true', help='변경 없이 보고서 출력')
  mode.add_argument('--apply', action='store_true', help='대상 파일에 치환 적용')
  parser.add_argument(
    '--root',
    type=Path,
    default=Path(__file__).resolve().parents[1],
    help='저장소 루트(테스트용; 기본값은 현재 저장소)',
  )
  return parser.parse_args()


def main() -> int:
  args = parse_args()
  try:
    report, _ = run(args.root.resolve(), dry_run=args.dry_run)
  except (FileNotFoundError, OSError) as error:
    print(f'오류: {error}')
    return 2
  print(report, end='')
  return 0


if __name__ == '__main__':
  raise SystemExit(main())
