#!/usr/bin/env python3
"""Coordinate recurring dashboard preparation without deploying it."""

from __future__ import annotations

import argparse
import json
import os
import shlex
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Sequence


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_REGISTRY_PATH = ROOT / "config" / "dashboard-daily-pages.json"
DEFAULT_STATE_PATH = ROOT / "artifacts" / "dashboard-daily-operator" / "state.json"
LOCAL_STAGES = (
    "source_acquired",
    "normalized",
    "rendered",
    "page_prepared",
    "verified",
)
RELEASE_STAGES = ("release_approved", "deployed", "live_verified")
ALL_STAGES = LOCAL_STAGES + RELEASE_STAGES


class OperatorError(RuntimeError):
    """Raised when a daily operation cannot satisfy its contract."""


def now_iso() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


def load_registry(path: Path = DEFAULT_REGISTRY_PATH) -> dict[str, Any]:
    try:
        registry = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise OperatorError(f"페이지 매니페스트를 읽을 수 없습니다: {path}") from error
    if registry.get("schemaVersion") != 1:
        raise OperatorError("지원하지 않는 페이지 매니페스트 버전입니다")
    pages = registry.get("pages")
    if not isinstance(pages, list) or not pages:
        raise OperatorError("페이지 매니페스트에 pages가 없습니다")
    page_ids: set[str] = set()
    for page in pages:
        page_id = page.get("id") if isinstance(page, dict) else None
        if not isinstance(page_id, str) or not page_id:
            raise OperatorError("페이지 id가 비어 있습니다")
        if page_id in page_ids:
            raise OperatorError(f"페이지 id가 중복됩니다: {page_id}")
        page_ids.add(page_id)
        adapter = page.get("adapter")
        if adapter not in {"command", "skill", "manual"}:
            raise OperatorError(f"지원하지 않는 adapter입니다: {page_id}")
        if adapter == "command":
            for field in ("prepare", "verify"):
                command = page.get(field)
                if not isinstance(command, list) or not all(
                    isinstance(part, str) and part for part in command
                ):
                    raise OperatorError(f"{page_id} {field} 명령이 올바르지 않습니다")
    return registry


def get_page(registry: dict[str, Any], page_id: str) -> dict[str, Any]:
    for page in registry["pages"]:
        if page["id"] == page_id:
            return page
    raise OperatorError(f"등록되지 않은 페이지입니다: {page_id}")


def repo_path(raw_path: str) -> Path:
    candidate = Path(raw_path).expanduser()
    return candidate if candidate.is_absolute() else ROOT / candidate


def nested_value(payload: Any, dotted_path: str) -> Any:
    value = payload
    for part in dotted_path.split("."):
        if not isinstance(value, dict) or part not in value:
            return None
        value = value[part]
    return value


def data_date(page: dict[str, Any]) -> str | None:
    raw_path = page.get("dateOutput")
    dotted_path = page.get("datePath")
    if not isinstance(raw_path, str) or not isinstance(dotted_path, str):
        return None
    path = repo_path(raw_path)
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    value = nested_value(payload, dotted_path)
    return value if isinstance(value, str) else None


def scan_page(page: dict[str, Any]) -> dict[str, Any]:
    output_paths = [repo_path(path) for path in page.get("outputs", [])]
    missing = [str(path.relative_to(ROOT)) for path in output_paths if not path.exists()]
    newest_mtime = max(
        (path.stat().st_mtime for path in output_paths if path.exists()),
        default=None,
    )
    return {
        "id": page["id"],
        "label": page["label"],
        "route": page["route"],
        "cadence": page["cadence"],
        "adapter": page["adapter"],
        "outputsReady": bool(output_paths) and not missing,
        "missingOutputs": missing,
        "dataDate": data_date(page),
        "outputModifiedAt": (
            datetime.fromtimestamp(newest_mtime, timezone.utc)
            .astimezone()
            .isoformat(timespec="seconds")
            if newest_mtime is not None
            else None
        ),
        "nextAction": next_action(page),
    }


def next_action(page: dict[str, Any]) -> str:
    if page["adapter"] == "command":
        return f"prepare --page {page['id']}"
    if page["adapter"] == "skill":
        return f"{page['skill']} 스킬 실행 후 record-stage"
    return page.get("note", "수동 갱신")


def atomic_write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.",
        suffix=".tmp",
        dir=path.parent,
    )
    temporary = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        os.replace(temporary, path)
    except Exception:
        temporary.unlink(missing_ok=True)
        raise


class StateStore:
    def __init__(self, path: Path = DEFAULT_STATE_PATH) -> None:
        self.path = path
        if not path.exists():
            self.payload: dict[str, Any] = {"schemaVersion": 1, "pages": {}}
            return
        try:
            self.payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise OperatorError(f"운영 상태 파일을 읽을 수 없습니다: {path}") from error
        if self.payload.get("schemaVersion") != 1:
            raise OperatorError("지원하지 않는 운영 상태 버전입니다")

    def page_state(self, page_id: str) -> dict[str, Any]:
        pages = self.payload.setdefault("pages", {})
        page = pages.setdefault(
            page_id,
            {
                "currentStage": None,
                "stages": {},
                "deployment": None,
                "history": [],
            },
        )
        page.setdefault("history", [])
        return page

    def advance(self, page_id: str, stage: str, evidence: str) -> None:
        if stage not in ALL_STAGES:
            raise OperatorError(f"알 수 없는 단계입니다: {stage}")
        page = self.page_state(page_id)
        stages = page["stages"]
        stage_index = ALL_STAGES.index(stage)
        has_downstream = stage in LOCAL_STAGES and any(
            ALL_STAGES.index(completed) > stage_index for completed in stages
        )
        if has_downstream:
            page["history"].append(
                {
                    "currentStage": page.get("currentStage"),
                    "stages": stages,
                    "deployment": page.get("deployment"),
                    "closedAt": now_iso(),
                }
            )
            page["stages"] = {
                completed: completed_evidence
                for completed, completed_evidence in stages.items()
                if ALL_STAGES.index(completed) < stage_index
            }
            page["deployment"] = None
            stages = page["stages"]
        missing = [required for required in ALL_STAGES[:stage_index] if required not in stages]
        if missing:
            raise OperatorError(
                f"{stage} 전에 필요한 단계가 없습니다: {', '.join(missing)}"
            )
        stages[stage] = {"at": now_iso(), "evidence": evidence}
        page["currentStage"] = stage
        self.payload["updatedAt"] = now_iso()
        atomic_write_json(self.path, self.payload)

    def has_stage(self, page_id: str, stage: str) -> bool:
        page = self.payload.get("pages", {}).get(page_id, {})
        return stage in page.get("stages", {})

    def record_deployment(
        self,
        page_id: str,
        approval_reference: str,
        deployment_sha: str,
        deployment_url: str,
        live_verified: bool,
    ) -> None:
        if not self.has_stage(page_id, "verified"):
            raise OperatorError("로컬 verified 단계가 없어 배포 기록을 남길 수 없습니다")
        self.advance(page_id, "release_approved", approval_reference)
        self.advance(page_id, "deployed", f"{deployment_sha} {deployment_url}")
        page = self.page_state(page_id)
        page["deployment"] = {
            "sha": deployment_sha,
            "url": deployment_url,
            "approvalReference": approval_reference,
        }
        atomic_write_json(self.path, self.payload)
        if live_verified:
            self.advance(page_id, "live_verified", f"라이브 확인: {deployment_url}")


def build_prepare_command(page: dict[str, Any], source: Path | None) -> list[str]:
    if page["adapter"] == "skill":
        raise OperatorError(
            f"{page['id']}는 {page['skill']} 스킬로 처리한 뒤 record-stage로 기록하세요"
        )
    if page["adapter"] == "manual":
        raise OperatorError(f"{page['id']}는 수동 갱신 대상입니다: {page.get('note', '')}")
    command = list(page["prepare"])
    if source is not None:
        source_arg = page.get("sourceArg")
        if not isinstance(source_arg, str):
            raise OperatorError(f"{page['id']}는 명시 원문 경로를 받지 않습니다")
        command.extend([source_arg, str(source)])
    return command


def command_text(command: list[str]) -> str:
    return shlex.join(command)


def run_checked(command: list[str]) -> None:
    result = subprocess.run(command, cwd=ROOT, check=False)
    if result.returncode != 0:
        raise OperatorError(
            f"명령이 실패했습니다(rc={result.returncode}): {command_text(command)}"
        )


def ensure_outputs(page: dict[str, Any]) -> None:
    missing = [path for path in page.get("outputs", []) if not repo_path(path).exists()]
    if missing:
        raise OperatorError(f"필수 출력이 없습니다: {', '.join(missing)}")


def prepare_page(
    page: dict[str, Any],
    source: Path | None,
    state_path: Path,
    dry_run: bool,
) -> None:
    command = build_prepare_command(page, source)
    print(command_text(command))
    if dry_run:
        return
    if source is not None and not source.exists():
        raise OperatorError(f"원문 경로를 찾을 수 없습니다: {source}")
    run_checked(command)
    ensure_outputs(page)
    store = StateStore(state_path)
    evidence = str(source) if source is not None else "어댑터 기본 원문 탐색 성공"
    for stage, stage_evidence in (
        ("source_acquired", evidence),
        ("normalized", command_text(command)),
        ("rendered", ", ".join(page.get("outputs", []))),
        ("page_prepared", f"{page['route']} 로컬 데이터 준비"),
    ):
        store.advance(page["id"], stage, stage_evidence)


def verify_page(page: dict[str, Any], state_path: Path, dry_run: bool) -> None:
    if page["adapter"] != "command":
        raise OperatorError(f"{page['id']}는 record-stage로 검증 근거를 기록하세요")
    command = list(page["verify"])
    print(command_text(command))
    if dry_run:
        return
    store = StateStore(state_path)
    if not store.has_stage(page["id"], "page_prepared"):
        raise OperatorError("page_prepared 단계가 없어 검증할 수 없습니다")
    run_checked(command)
    store.advance(page["id"], "verified", command_text(command))


def report_payload(registry: dict[str, Any], state_path: Path) -> dict[str, Any]:
    store = StateStore(state_path)
    return {
        "generatedAt": now_iso(),
        "pages": [
            {
                **scan_page(page),
                "state": store.payload.get("pages", {}).get(page["id"]),
            }
            for page in registry["pages"]
        ],
    }


def print_human_report(payload: dict[str, Any]) -> None:
    for page in payload["pages"]:
        state = page.get("state") or {}
        stage = state.get("currentStage") or "미시작"
        data_value = page.get("dataDate") or "날짜 없음"
        readiness = "준비" if page["outputsReady"] else "확인 필요"
        print(
            f"{page['id']}: {stage} | {readiness} | 데이터 {data_value} | {page['nextAction']}"
        )


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(description=__doc__)
    root.add_argument("--registry", type=Path, default=DEFAULT_REGISTRY_PATH)
    commands = root.add_subparsers(dest="command", required=True)

    scan = commands.add_parser("scan", help="출력 최신성을 읽기 전용으로 확인")
    scan.add_argument("--json", action="store_true")
    scan.add_argument("--state", type=Path, default=DEFAULT_STATE_PATH)

    prepare = commands.add_parser("prepare", help="한 페이지의 로컬 데이터를 준비")
    prepare.add_argument("--page", required=True)
    prepare.add_argument("--source", type=Path)
    prepare.add_argument("--dry-run", action="store_true")
    prepare.add_argument("--state", type=Path, default=DEFAULT_STATE_PATH)

    verify = commands.add_parser("verify", help="한 페이지의 집중 검증을 실행")
    verify.add_argument("--page", required=True)
    verify.add_argument("--dry-run", action="store_true")
    verify.add_argument("--state", type=Path, default=DEFAULT_STATE_PATH)

    report = commands.add_parser("report", help="스캔 결과와 단계 상태를 함께 출력")
    report.add_argument("--json", action="store_true")
    report.add_argument("--state", type=Path, default=DEFAULT_STATE_PATH)

    record = commands.add_parser("record-stage", help="스킬·수동 단계의 근거를 기록")
    record.add_argument("--page", required=True)
    record.add_argument("--stage", choices=LOCAL_STAGES, required=True)
    record.add_argument("--evidence", required=True)
    record.add_argument("--state", type=Path, default=DEFAULT_STATE_PATH)

    release = commands.add_parser(
        "record-release",
        help="실제 배포를 수행하지 않고 승인·배포·라이브 확인 근거만 기록",
    )
    release.add_argument("--page", required=True)
    release.add_argument("--approval-reference", required=True)
    release.add_argument("--deployment-sha", required=True)
    release.add_argument("--deployment-url", required=True)
    release.add_argument("--live-verified", action="store_true")
    release.add_argument("--state", type=Path, default=DEFAULT_STATE_PATH)
    return root


def main(argv: Sequence[str] | None = None) -> int:
    arguments = parser().parse_args(argv)
    try:
        registry = load_registry(arguments.registry)
        if arguments.command == "scan":
            payload = {
                "generatedAt": now_iso(),
                "pages": [scan_page(page) for page in registry["pages"]],
            }
            if arguments.json:
                print(json.dumps(payload, ensure_ascii=False, indent=2))
            else:
                print_human_report(payload)
            return 0
        if arguments.command == "report":
            payload = report_payload(registry, arguments.state)
            if arguments.json:
                print(json.dumps(payload, ensure_ascii=False, indent=2))
            else:
                print_human_report(payload)
            return 0

        page = get_page(registry, arguments.page)
        if arguments.command == "prepare":
            prepare_page(page, arguments.source, arguments.state, arguments.dry_run)
        elif arguments.command == "verify":
            verify_page(page, arguments.state, arguments.dry_run)
        elif arguments.command == "record-stage":
            StateStore(arguments.state).advance(
                page["id"], arguments.stage, arguments.evidence
            )
        elif arguments.command == "record-release":
            StateStore(arguments.state).record_deployment(
                page["id"],
                arguments.approval_reference,
                arguments.deployment_sha,
                arguments.deployment_url,
                arguments.live_verified,
            )
        return 0
    except OperatorError as error:
        print(f"오류: {error}", file=sys.stderr)
        if "스킬로 처리" in str(error):
            return 3
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
