#!/usr/bin/env python3
"""C-4 pre-push gate: build-time data imports must be git-tracked.

Vercel checks out only git-tracked files. A component that does
`import x from '../data/foo.json'` builds fine locally but fails on
Vercel with 'Module not found' when data/ is gitignored — this has
recurred 3 times (garlic, consignment, ReeferMovement week22).

Scans components/ app/ lib/ for static .json/.csv imports, resolves
them repo-relative, and exits 1 listing any path absent from
`git ls-files`. Fix: `git add -f <path>` or move to a fetch()-served
location under public/data.
"""
import os
import re
import subprocess
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(REPO)

PAT = re.compile(
    r"""(?:import\s+[^'"]*from\s*|import\s*\(\s*)"""
    r"""['"]([^'"]*(?:\.\./|@/)?(?:public/)?data/[^'"]+\.(?:json|csv))['"]"""
)
SKIP_DIRS = {"node_modules", ".next", ".git", "_archive"}

imports = {}  # resolved path -> first importer
for top in ("components", "app", "lib"):
    for root, dirs, files in os.walk(top):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if not f.endswith((".ts", ".tsx")):
                continue
            fp = os.path.join(root, f)
            try:
                src = open(fp, encoding="utf-8", errors="replace").read()
            except OSError:
                continue
            for m in PAT.finditer(src):
                imp = m.group(1)
                if imp.startswith("@/"):
                    resolved = imp[2:]
                else:
                    resolved = os.path.normpath(
                        os.path.join(os.path.dirname(fp), imp)
                    )
                imports.setdefault(resolved.lstrip("./"), fp)

tracked = set(
    subprocess.run(
        ["git", "ls-files"], capture_output=True, text=True
    ).stdout.splitlines()
)
violations = sorted(p for p in imports if p not in tracked)

if violations:
    print("❌ [C-4] 빌드타임 data import가 git 미추적 — Vercel 빌드 실패 예정:")
    for p in violations:
        exists = "" if os.path.exists(p) else "  (로컬에도 없음!)"
        print(f"   - {p}{exists}")
        print(f"     importer: {imports[p]}")
    print("\n   해결: git add -f <경로>  또는 public/data + fetch() 전환")
    sys.exit(1)

print(f"✅ [C-4] 빌드타임 data import {len(imports)}건 전부 git 추적됨")
