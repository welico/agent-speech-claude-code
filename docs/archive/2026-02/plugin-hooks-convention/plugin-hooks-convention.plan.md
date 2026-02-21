# plugin-hooks-convention Planning Document

> **Summary**: Claude Code 공식 플러그인 컨벤션에 맞게 TTS Hook 스크립트를 플러그인 디렉토리 내부로 이동하고 구조를 재편한다.
>
> **Project**: agent-speech-claude-code
> **Version**: 0.1.0
> **Author**: welico
> **Date**: 2026-02-16
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

현재 `~/.claude/claude-tts.sh` 로 위치한 TTS Hook 스크립트가 Claude Code 공식 플러그인 컨벤션을 따르지 않는다.
`ralph-loop` 공식 플러그인을 레퍼런스로 삼아, Hook 스크립트를 플러그인 디렉토리 내부(`hooks/` 폴더)로 이동하고
`${CLAUDE_PLUGIN_ROOT}` 변수를 사용하여 절대경로 하드코딩을 제거한다.

### 1.2 Background

- `ralph-loop` 공식 플러그인 구조 분석 결과, Hook 스크립트는 플러그인 디렉토리 내 `hooks/` 폴더에 위치해야 함
- `hooks/hooks.json`이 Hook 설정을 정의하고, `${CLAUDE_PLUGIN_ROOT}` 변수로 절대경로를 참조
- 현재 `~/.claude/settings.json`에 절대경로(`/Users/welico/.claude/claude-tts.sh`)가 하드코딩되어 다른 사용자 환경에서 동작하지 않음
- 플러그인이 설치되면 Hook이 자동 등록되어야 하며, 이를 위해 `hooks.json` 기반 구조가 필요

### 1.3 Reference

- `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/ralph-loop/hooks/hooks.json`
- `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/ralph-loop/hooks/stop-hook.sh`

---

## 2. Scope

### 2.1 In Scope

- [ ] `.claude-plugin/agent-speech-claude-code/hooks/` 디렉토리 생성
- [ ] `hooks/hooks.json` 작성 (Stop hook 설정, `${CLAUDE_PLUGIN_ROOT}` 참조)
- [ ] `hooks/stop-hook.sh` 작성 (현재 `claude-tts.sh` 내용 기반, jq 사용으로 개선)
- [ ] `~/.claude/settings.json`의 Stop hook을 `hooks.json` 기반으로 전환
- [ ] `~/.claude/claude-tts.sh` 파일 제거 (settings.json hook 제거 후)

### 2.2 Out of Scope

- Hook 로직 변경 (음성 변환 기능 자체는 수정하지 않음)
- 새로운 Hook 이벤트 추가 (PreToolUse, PostToolUse 등)
- macOS 외 플랫폼 지원

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `hooks/hooks.json`이 Stop hook을 `${CLAUDE_PLUGIN_ROOT}` 기준으로 정의 | High | Pending |
| FR-02 | `hooks/stop-hook.sh`가 transcript에서 마지막 assistant 텍스트를 추출해 TTS 실행 | High | Pending |
| FR-03 | `jq`를 사용하여 JSON 파싱 (ralph-loop 방식과 일치) | Medium | Pending |
| FR-04 | `~/.claude/settings.json`에서 하드코딩된 hook 경로 제거 | High | Pending |
| FR-05 | 플러그인 재설치 후 Hook이 자동 등록되어야 함 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Portability | 다른 사용자 Mac에서도 동작 (절대경로 없음) | 다른 환경에서 설치 테스트 |
| Convention | ralph-loop 공식 구조와 동일한 패턴 | 디렉토리 구조 비교 |
| Reliability | TTS 실패 시 Claude Code 동작에 영향 없음 | hook exit code 0 확인 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] `.claude-plugin/agent-speech-claude-code/hooks/hooks.json` 생성
- [ ] `.claude-plugin/agent-speech-claude-code/hooks/stop-hook.sh` 생성 및 실행 권한 부여
- [ ] `hooks.json` 방식으로 Stop hook 동작 확인
- [ ] `~/.claude/claude-tts.sh` 및 `settings.json` 기존 hook 항목 제거
- [ ] 응답 음성 출력 정상 동작 확인

### 4.2 Quality Criteria

- [ ] `stop-hook.sh`가 `jq` 기반으로 JSON 파싱 (python3 의존성 제거)
- [ ] 스크립트 실행 시 오류가 없을 경우 exit 0 반환
- [ ] 500자 제한 TTS 정상 동작

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| `hooks.json` 기반 자동 등록이 실제로 동작하지 않을 수 있음 | High | Medium | settings.json 수동 등록 fallback 유지 |
| `jq` 미설치 환경 | Medium | Low | `which jq` 체크 후 python3 fallback 추가 |
| 기존 `~/.claude/claude-tts.sh` 삭제 후 TTS 중단 | High | Low | 새 스크립트 동작 확인 후 삭제 |

---

## 6. Architecture Considerations

### 6.1 Target Structure

```
.claude-plugin/
└── agent-speech-claude-code/
    ├── hooks/                          ← 신규 추가
    │   ├── hooks.json                  ← Hook 설정 (Stop 이벤트)
    │   └── stop-hook.sh               ← TTS 실행 스크립트
    ├── plugin.json
    ├── .mcp.json
    └── README.md
```

### 6.2 hooks.json 구조

```json
{
  "description": "Agent Speech Plugin stop hook for TTS",
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/stop-hook.sh"
          }
        ]
      }
    ]
  }
}
```

### 6.3 settings.json 변경

**Before** (현재 - 하드코딩):
```json
"hooks": {
  "Stop": [{
    "matcher": "",
    "hooks": [{"type": "command", "command": "/Users/welico/.claude/claude-tts.sh"}]
  }]
}
```

**After** (목표 - hooks.json 자동 등록 또는 ${CLAUDE_PLUGIN_ROOT} 참조):
```json
"hooks": {}
```
→ hooks.json이 플러그인 설치 시 자동으로 적용되어야 함. 자동 적용이 안 될 경우 settings.json에 `${CLAUDE_PLUGIN_ROOT}` 변수 참조 방식으로 유지.

---

## 7. Convention Prerequisites

### 7.1 Reference Implementation

- `ralph-loop` 플러그인 구조를 완전히 복제
- `jq` 사용으로 bash-native JSON 파싱 (python3 의존 제거)
- `${CLAUDE_PLUGIN_ROOT}` 환경변수 활용

### 7.2 File Naming Convention

| 파일 | ralph-loop 참조 | agent-speech 적용 |
|------|-----------------|------------------|
| Hook 설정 | `hooks/hooks.json` | `hooks/hooks.json` |
| Stop hook | `hooks/stop-hook.sh` | `hooks/stop-hook.sh` |

---

## 8. Next Steps

1. [ ] Design 문서 작성 (`plugin-hooks-convention.design.md`)
2. [ ] `hooks/` 디렉토리 및 파일 구현
3. [ ] 기존 `~/.claude/claude-tts.sh` 마이그레이션

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-16 | Initial draft | welico |
