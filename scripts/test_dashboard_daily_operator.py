#!/usr/bin/env python3
"""Contract tests for the dashboard daily operator."""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OPERATOR_SCRIPT = ROOT / "scripts" / "dashboard_daily_operator.py"
REGISTRY_PATH = ROOT / "config" / "dashboard-daily-pages.json"


def load_operator_module():
    spec = importlib.util.spec_from_file_location("dashboard_daily_operator", OPERATOR_SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError("데일리 운영자 모듈을 불러올 수 없습니다")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class DashboardDailyOperatorTest(unittest.TestCase):
    def run_cli(self, *arguments: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(OPERATOR_SCRIPT), *arguments],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )

    def test_registry_covers_recurring_pages_and_keeps_deploy_out_of_commands(self) -> None:
        module = load_operator_module()
        registry = module.load_registry(REGISTRY_PATH)
        pages = {page["id"]: page for page in registry["pages"]}

        self.assertEqual(
            set(pages),
            {
                "market-briefing",
                "fleet-daily",
                "unloading-daily",
                "bangkok-weekly",
                "gmts-weekly",
                "logistics-weekly",
            },
        )
        self.assertEqual(pages["market-briefing"]["route"], "/market")
        self.assertEqual(pages["unloading-daily"]["adapter"], "skill")
        self.assertEqual(
            pages["unloading-daily"]["skill"],
            "silla-unloading-daily-report",
        )

        serialized = json.dumps(registry, ensure_ascii=False)
        for forbidden in ("git push", "vercel deploy", "reset --hard", "--no-verify"):
            self.assertNotIn(forbidden, serialized)

    def test_scan_is_read_only_and_reports_output_dates(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            state = Path(temporary_directory) / "state.json"
            result = self.run_cli(
                "scan",
                "--json",
                "--state",
                str(state),
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertFalse(state.exists())
            payload = json.loads(result.stdout)
            market = next(page for page in payload["pages"] if page["id"] == "market-briefing")
            self.assertTrue(market["outputsReady"])
            self.assertRegex(market["dataDate"], r"^\d{4}-\d{2}-\d{2}$")

    def test_prepare_command_accepts_explicit_source_without_shell_interpolation(self) -> None:
        module = load_operator_module()
        registry = module.load_registry(REGISTRY_PATH)
        market = module.get_page(registry, "market-briefing")
        source = Path("/tmp/참치 뉴스; touch SHOULD_NOT_RUN.html")

        command = module.build_prepare_command(market, source)

        self.assertEqual(command[:2], ["python3", "scripts/sync_daily_briefing.py"])
        self.assertEqual(command[-2:], ["--input", str(source)])
        self.assertIsInstance(command, list)

    def test_state_resumes_from_prepared_page_and_rejects_skipped_stage(self) -> None:
        module = load_operator_module()
        with tempfile.TemporaryDirectory() as temporary_directory:
            state_path = Path(temporary_directory) / "state.json"
            store = module.StateStore(state_path)

            with self.assertRaises(module.OperatorError):
                store.advance("market-briefing", "verified", "검증을 건너뜀")

            for stage in (
                "source_acquired",
                "normalized",
                "rendered",
                "page_prepared",
            ):
                store.advance("market-briefing", stage, f"{stage} 근거")

            resumed = module.StateStore(state_path)
            resumed.advance("market-briefing", "verified", "집중 테스트 통과")
            payload = json.loads(state_path.read_text(encoding="utf-8"))

            self.assertIn("page_prepared", payload["pages"]["market-briefing"]["stages"])
            self.assertEqual(
                payload["pages"]["market-briefing"]["currentStage"],
                "verified",
            )

    def test_new_source_cycle_invalidates_previous_verification_and_deployment(self) -> None:
        module = load_operator_module()
        with tempfile.TemporaryDirectory() as temporary_directory:
            state_path = Path(temporary_directory) / "state.json"
            store = module.StateStore(state_path)
            for stage in module.LOCAL_STAGES:
                store.advance("market-briefing", stage, "2026-08-14")
            store.record_deployment(
                "market-briefing",
                "사용자 배포 요청",
                "old-sha",
                "https://old.example.invalid",
                True,
            )

            store.advance(
                "market-briefing",
                "source_acquired",
                "2026-08-15 게시판 HTML",
            )
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            page_state = payload["pages"]["market-briefing"]

            self.assertEqual(set(page_state["stages"]), {"source_acquired"})
            self.assertIsNone(page_state["deployment"])
            self.assertEqual(page_state["currentStage"], "source_acquired")
            self.assertEqual(len(page_state["history"]), 1)

    def test_reworking_an_earlier_stage_invalidates_only_downstream_evidence(self) -> None:
        module = load_operator_module()
        with tempfile.TemporaryDirectory() as temporary_directory:
            state_path = Path(temporary_directory) / "state.json"
            store = module.StateStore(state_path)
            for stage in module.LOCAL_STAGES:
                store.advance("fleet-daily", stage, "첫 실행")

            store.advance("fleet-daily", "normalized", "원문 파서 수정 후 재검산")
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            page_state = payload["pages"]["fleet-daily"]

            self.assertEqual(
                set(page_state["stages"]),
                {"source_acquired", "normalized"},
            )
            self.assertEqual(page_state["currentStage"], "normalized")
            self.assertEqual(len(page_state["history"]), 1)

    def test_dry_run_does_not_create_state_or_execute_adapter(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            state = Path(temporary_directory) / "state.json"
            result = self.run_cli(
                "prepare",
                "--page",
                "market-briefing",
                "--source",
                "/does/not/exist.html",
                "--dry-run",
                "--state",
                str(state),
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("sync_daily_briefing.py", result.stdout)
            self.assertFalse(state.exists())

    def test_skill_adapter_stops_with_specific_delegation_instruction(self) -> None:
        result = self.run_cli(
            "prepare",
            "--page",
            "unloading-daily",
            "--dry-run",
        )

        self.assertEqual(result.returncode, 3)
        self.assertIn("silla-unloading-daily-report", result.stderr)

    def test_release_record_requires_verified_state_and_explicit_approval(self) -> None:
        module = load_operator_module()
        with tempfile.TemporaryDirectory() as temporary_directory:
            state_path = Path(temporary_directory) / "state.json"
            store = module.StateStore(state_path)
            for stage in module.LOCAL_STAGES:
                store.advance("market-briefing", stage, stage)

            missing_approval = self.run_cli(
                "record-release",
                "--page",
                "market-briefing",
                "--deployment-sha",
                "abc123",
                "--deployment-url",
                "https://example.invalid",
                "--state",
                str(state_path),
            )
            self.assertNotEqual(missing_approval.returncode, 0)

            recorded = self.run_cli(
                "record-release",
                "--page",
                "market-briefing",
                "--approval-reference",
                "사용자 배포 요청 2026-08-17",
                "--deployment-sha",
                "abc123",
                "--deployment-url",
                "https://example.invalid",
                "--live-verified",
                "--state",
                str(state_path),
            )
            self.assertEqual(recorded.returncode, 0, recorded.stderr)
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            page_state = payload["pages"]["market-briefing"]
            self.assertEqual(page_state["currentStage"], "live_verified")
            self.assertEqual(page_state["deployment"]["sha"], "abc123")


if __name__ == "__main__":
    unittest.main()
