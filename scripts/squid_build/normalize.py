"""사용자 노출 오징어 산출물의 문자 규칙을 한 경계에서 강제한다."""

from __future__ import annotations


RAW_EVIDENCE_KEYS = {
    "text",
    "source_excerpt",
    "source_text",
    "raw_text",
    "original_text",
    "raw_value",
}


def normalize_display_dashes(value, *, preserve_raw_evidence: bool = False):
    """표시 문자열의 앰대시를 바꾸되 공식 원문 필드는 보존한다."""
    if isinstance(value, str):
        return value.replace("—", "-")
    if isinstance(value, list):
        return [
            normalize_display_dashes(item, preserve_raw_evidence=preserve_raw_evidence)
            for item in value
        ]
    if isinstance(value, tuple):
        return tuple(
            normalize_display_dashes(item, preserve_raw_evidence=preserve_raw_evidence)
            for item in value
        )
    if isinstance(value, dict):
        normalized = {}
        for key, item in value.items():
            normalized_key = normalize_display_dashes(key)
            if preserve_raw_evidence and key in RAW_EVIDENCE_KEYS:
                normalized[normalized_key] = item
            else:
                normalized[normalized_key] = normalize_display_dashes(
                    item,
                    preserve_raw_evidence=preserve_raw_evidence,
                )
        return normalized
    return value
