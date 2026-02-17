# plugin-hooks-convention Analysis Report

> **Analysis Type**: Gap Analysis (Design vs Implementation)
>
> **Project**: agent-speech-plugin
> **Version**: 0.1.0
> **Date**: 2026-02-16
> **Match Rate**: 92% (Pass)

---

## Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| Architecture Compliance | 100% | Pass |
| Convention Compliance | 95% | Pass |
| Design Match | 88% | Warning |
| **Overall** | **92%** | **Pass** |

---

## Functional Requirements Analysis

| ID | Requirement | Score | Status |
|----|-------------|-------|--------|
| FR-01 | hooks.json defines Stop hook via `${CLAUDE_PLUGIN_ROOT}` | 100% | Pass |
| FR-02 | stop-hook.sh extracts assistant text + TTS | 100% | Pass |
| FR-03 | jq-based JSON parsing (python3 제거) | 100% | Pass |
| FR-04 | settings.json 하드코딩 경로 제거 | 50% | Fail |
| FR-05 | hooks.json 자동 등록 | 75% | Warning |

---

## Primary Gap

### settings.json 경로 이식성 문제

**Design 목표**: `"hooks": {}` (Option A) 또는 `${CLAUDE_PLUGIN_ROOT}` 참조 (Option B)

**실제 구현**:
```json
"command": "/Users/warezio/.claude/plugins/cache/warezio/agent-speech-plugin/0.1.0/.claude-plugin/agent-speech-plugin/hooks/stop-hook.sh"
```

**영향**: 버전 업그레이드 시 경로 수동 업데이트 필요. 다른 사용자 환경에서 미작동.

**해결 방안**:
- Option A: hooks 섹션 완전 제거 (hooks.json 자동 등록 확인 필요)
- Option B: `${CLAUDE_PLUGIN_ROOT}` 변수가 settings.json에서 지원되는지 확인
- Option C: 플랫폼 제약으로 문서화

---

## What Was Implemented Correctly

- `hooks/` 디렉토리가 `.claude-plugin/agent-speech-plugin/` 하위에 생성됨
- `hooks.json`이 ralph-loop 패턴과 동일한 구조
- `stop-hook.sh`에 실행 권한 부여됨
- `jq` 기반 파싱 구현 (python3 의존성 제거)
- 500자 제한 적용
- 구버전 `~/.claude/claude-tts.sh` 삭제 완료
- 소스 레포 + 설치 캐시 모두 동기화됨

---

## Conclusion

92% 달성으로 통과 기준(≥90%) 충족. settings.json 이식성 이슈가 유일한 주요 갭이며, 플랫폼 제약 여부 확인 후 문서화 또는 수정 필요.
