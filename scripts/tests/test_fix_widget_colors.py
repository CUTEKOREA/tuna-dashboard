from __future__ import annotations

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT = REPO_ROOT / 'scripts' / 'fix_widget_colors.py'


class FixWidgetColorsTest(unittest.TestCase):
  def test_dry_run_only_reports_supported_style_positions(self) -> None:
    source = '''export function Widget() {
  const statusByName = { 위험: '#ef4444' };
  const sameColor = currentColor === '#38bdf8';
  // color: '#10b981'
  return (
    <>
      <svg stroke="#94A3B8" fill={'#10b981'}>
        <stop stopColor="#f59e0b" />
      </svg>
      <div
        style={{
          color: '#64748b',
          background: 'linear-gradient(#38bdf8, #3b82f6)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 0 4px #8b5cf6',
          filter: 'drop-shadow(0 0 #ec4899)',
        }}
      />
      <style jsx>{`
        .card {
          color: #f8fafc;
          background-color: #1a2442;
          border-color: #cbd5e1;
          box-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
        }
      `}</style>
    </>
  );
}
'''

    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir)
      target = root / 'components' / 'Widget.tsx'
      target.parent.mkdir(parents=True)
      target.write_text(source, encoding='utf-8')

      result = subprocess.run(
        [sys.executable, str(SCRIPT), '--dry-run', '--root', str(root)],
        check=False,
        capture_output=True,
        text=True,
      )

      self.assertEqual(result.returncode, 0, result.stderr)
      self.assertIn('총 치환 수: 12', result.stdout)
      self.assertIn('변경 파일 수: 1', result.stdout)
      self.assertEqual(target.read_text(encoding='utf-8'), source)

  def test_multiline_style_values_are_replaced(self) -> None:
    source = '''export function Widget({ danger }: { danger: boolean }) {
  return (
    <svg
      stroke={
        danger ? '#ef4444' : '#10b981'
      }
      style={{
        background:
          'linear-gradient(135deg, #38bdf8, #3b82f6)',
      }}
    />
  );
}
'''

    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir)
      target = root / 'components' / 'Widget.tsx'
      target.parent.mkdir(parents=True)
      target.write_text(source, encoding='utf-8')

      result = subprocess.run(
        [sys.executable, str(SCRIPT), '--apply', '--root', str(root)],
        check=False,
        capture_output=True,
        text=True,
      )

      self.assertEqual(result.returncode, 0, result.stderr)
      self.assertIn('총 치환 수: 4', result.stdout)
      updated = target.read_text(encoding='utf-8')
      self.assertIn("danger ? 'var(--w-red-500)' : 'var(--w-emerald-500)'", updated)
      self.assertIn(
        "'linear-gradient(135deg, var(--w-sky-400), var(--w-blue-500))'",
        updated,
      )

  def test_data_object_color_values_are_preserved(self) -> None:
    source = '''const kpis = [
  { title: '위험', color: '#ef4444' },
  { title: '주의', color: '#f59e0b' },
];

export function Widget() {
  return <p style={{ color: '#94a3b8' }}>설명</p>;
}
'''

    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir)
      target = root / 'components' / 'Widget.tsx'
      target.parent.mkdir(parents=True)
      target.write_text(source, encoding='utf-8')

      result = subprocess.run(
        [sys.executable, str(SCRIPT), '--apply', '--root', str(root)],
        check=False,
        capture_output=True,
        text=True,
      )

      self.assertEqual(result.returncode, 0, result.stderr)
      self.assertIn('총 치환 수: 1', result.stdout)
      self.assertIn('비스타일/의미값: 2', result.stdout)
      updated = target.read_text(encoding='utf-8')
      self.assertIn("color: '#ef4444'", updated)
      self.assertIn("color: '#f59e0b'", updated)
      self.assertIn("color: 'var(--w-slate-400)'", updated)

  def test_unlisted_jsx_color_props_are_preserved(self) -> None:
    source = '''export function Widget() {
  return (
    <>
      <svg stroke="#94a3b8" />
      <Card iconColor="#8b5cf6" trendColor="#f59e0b" />
    </>
  );
}
'''

    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir)
      target = root / 'components' / 'Widget.tsx'
      target.parent.mkdir(parents=True)
      target.write_text(source, encoding='utf-8')

      result = subprocess.run(
        [sys.executable, str(SCRIPT), '--apply', '--root', str(root)],
        check=False,
        capture_output=True,
        text=True,
      )

      self.assertEqual(result.returncode, 0, result.stderr)
      self.assertIn('총 치환 수: 1', result.stdout)
      updated = target.read_text(encoding='utf-8')
      self.assertIn('stroke="var(--w-slate-400)"', updated)
      self.assertIn('iconColor="#8b5cf6"', updated)
      self.assertIn('trendColor="#f59e0b"', updated)

  def test_replaced_lines_do_not_keep_trailing_whitespace(self) -> None:
    source = '''export function Widget() {
  return <svg stroke="#94a3b8" />__TRAILING_SPACES__
}
'''.replace('__TRAILING_SPACES__', '   ')

    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir)
      target = root / 'components' / 'Widget.tsx'
      target.parent.mkdir(parents=True)
      target.write_text(source, encoding='utf-8')

      result = subprocess.run(
        [sys.executable, str(SCRIPT), '--apply', '--root', str(root)],
        check=False,
        capture_output=True,
        text=True,
      )

      self.assertEqual(result.returncode, 0, result.stderr)
      self.assertEqual(
        target.read_text(encoding='utf-8'),
        '''export function Widget() {
  return <svg stroke="var(--w-slate-400)" />
}
''',
      )

  def test_rgba_replacement_preserves_alpha_in_supported_style_positions(self) -> None:
    source = '''const semanticPalette = {
  danger: 'rgba(239, 68, 68, 0.4)',
};

export function Widget() {
  return (
    <>
      <svg stroke="rgba(56, 189, 248, .75)" />
      <div
        style={{
          background: 'rgba(148,163,184,50%)',
          boxShadow: '0 0 8px rgba(16, 185, 129, 0)',
        }}
      />
      <style jsx>{`
        .card { border-color: rgba(245, 158, 11, 1); }
      `}</style>
    </>
  );
}
'''

    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir)
      target = root / 'components' / 'Widget.tsx'
      target.parent.mkdir(parents=True)
      target.write_text(source, encoding='utf-8')

      result = subprocess.run(
        [sys.executable, str(SCRIPT), '--apply', '--root', str(root)],
        check=False,
        capture_output=True,
        text=True,
      )

      self.assertEqual(result.returncode, 0, result.stderr)
      self.assertIn('총 치환 수: 4', result.stdout)
      updated = target.read_text(encoding='utf-8')
      self.assertIn('rgba(var(--w-sky-400-rgb), .75)', updated)
      self.assertIn('rgba(var(--w-slate-400-rgb), 50%)', updated)
      self.assertIn('rgba(var(--w-emerald-500-rgb), 0)', updated)
      self.assertIn('rgba(var(--w-amber-500-rgb), 1)', updated)
      self.assertIn("danger: 'rgba(239, 68, 68, 0.4)'", updated)

  def test_html_style_replacement_is_limited_to_verified_dom_insertions(self) -> None:
    verified_files = (
      'PacificVesselMap.tsx',
      'ColdStorageMap.tsx',
      'TunaRestaurantMap.tsx',
      'PetFoodMap.tsx',
    )
    source = '''const option = {
  textStyle: { color: '#f8fafc' },
  formatter: () => `<span style="color:#94a3b8">설명</span>`,
};
'''

    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir)
      components = root / 'components'
      components.mkdir(parents=True)
      for filename in (*verified_files, 'UnverifiedMap.tsx'):
        (components / filename).write_text(source, encoding='utf-8')

      result = subprocess.run(
        [sys.executable, str(SCRIPT), '--apply', '--root', str(root)],
        check=False,
        capture_output=True,
        text=True,
      )

      self.assertEqual(result.returncode, 0, result.stderr)
      self.assertIn('총 치환 수: 4', result.stdout)
      self.assertIn('변경 파일 수: 4', result.stdout)
      for filename in verified_files:
        updated = (components / filename).read_text(encoding='utf-8')
        self.assertIn('style="color:var(--w-slate-400)"', updated)
        self.assertIn("textStyle: { color: '#f8fafc' }", updated)
      self.assertEqual(
        (components / 'UnverifiedMap.tsx').read_text(encoding='utf-8'),
        source,
      )

  def test_accent_color_is_replaced_only_inside_style_containers(self) -> None:
    source = '''const semanticAccent = { accentColor: '#ec4899' };

export function Widget() {
  return (
    <>
      <input style={{ width: '100%', accentColor: '#ec4899' }} />
      <Card accentColor="#ec4899" />
    </>
  );
}
'''

    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir)
      target = root / 'components' / 'Widget.tsx'
      target.parent.mkdir(parents=True)
      target.write_text(source, encoding='utf-8')

      result = subprocess.run(
        [sys.executable, str(SCRIPT), '--apply', '--root', str(root)],
        check=False,
        capture_output=True,
        text=True,
      )

      self.assertEqual(result.returncode, 0, result.stderr)
      self.assertIn('총 치환 수: 1', result.stdout)
      updated = target.read_text(encoding='utf-8')
      self.assertIn("style={{ width: '100%', accentColor: 'var(--w-pink-500)' }}", updated)
      self.assertIn("semanticAccent = { accentColor: '#ec4899' }", updated)
      self.assertIn('accentColor="#ec4899"', updated)

  def test_mixed_hex_and_rgba_replacements_keep_original_offsets(self) -> None:
    source = '''export function Widget() {
  return (
    <input
      style={{ background: 'rgba(148, 163, 184, 0.2)', cursor: 'pointer', accentColor: '#f59e0b' }}
    />
  );
}
'''

    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir)
      target = root / 'components' / 'Widget.tsx'
      target.parent.mkdir(parents=True)
      target.write_text(source, encoding='utf-8')

      result = subprocess.run(
        [sys.executable, str(SCRIPT), '--apply', '--root', str(root)],
        check=False,
        capture_output=True,
        text=True,
      )

      self.assertEqual(result.returncode, 0, result.stderr)
      self.assertIn('총 치환 수: 2', result.stdout)
      self.assertIn(
        "style={{ background: 'rgba(var(--w-slate-400-rgb), 0.2)', "
        "cursor: 'pointer', accentColor: 'var(--w-amber-500)' }}",
        target.read_text(encoding='utf-8'),
      )


if __name__ == '__main__':
  unittest.main()
