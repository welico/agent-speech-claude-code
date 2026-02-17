# tts-i18n Planning Document

> **Summary**: Google Translate 무료 비공식 API를 사용하여 모든 TTS 메세지를 사용자 설정 언어로 번역 후 음성 안내한다. 오프라인 폴백으로 원문 그대로 읽는다.
>
> **Project**: agent-speech-plugin
> **Version**: 0.3.0
> **Author**: warezio
> **Date**: 2026-02-16
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

현재 모든 훅 메세지가 영어로 고정되어 있다. 사용자가 `"language": "ko"` 설정 시:
- "Permission required for Bash" → "Bash에 필요한 권한"
- "The task has been completed." → "작업이 완료되었습니다."
- Claude 응답 요약(stop-hook)도 한국어 번역 후 음성 안내

### 1.2 번역 방식: Google Translate 무료 비공식 API

```
https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ko&dt=t&q=...
```

**검증 완료 (macOS, curl 기본 설치):**

| 입력 | 출력 |
|------|------|
| "The task has been completed." | "작업이 완료되었습니다." |
| "Permission required for Bash" | "Bash에 필요한 권한" |
| "The implementation is complete. All 5 hooks updated." | "구현이 완료되었습니다. 5개 후크 모두 업데이트되었습니다." |

**특징:**
- API 키 불필요
- `curl` + `jq` (기존 의존성, 추가 설치 없음)
- 인터넷 연결 필요 (오프라인 시 원문 폴백)
- 비공식 엔드포인트 (장기적 안정성 보장 없음 — 폴백으로 해소)

---

## 2. Scope

### 2.1 In Scope (v0.3.0)

| 기능 | 대상 훅 | 설명 |
|------|--------|------|
| Permission 메세지 번역 | `permission-hook.sh` | "Permission required for {tool}" |
| Subagent 메세지 번역 | `subagent-stop-hook.sh` | "Subagent {type} completed" |
| Task 메세지 번역 | `task-completed-hook.sh` | "Task completed: {title}" |
| Notification 메세지 번역 | `notification-hook.sh` | Claude Code 알림 메세지 |
| Stop 요약 번역 | `stop-hook.sh` | Claude 응답 first-sentence 요약 번역 |
| 언어 설정 추가 | `config.json` | `"language": "ko"` 필드 |
| 번역 헬퍼 | `translate.sh` | curl + jq 번역 함수, 오프라인 폴백 |

### 2.2 Out of Scope

- 한국어/영어 외 언어 (구조는 확장 가능하게)
- 정적 번역 테이블 (API 방식으로 대체)
- Windows/Linux 지원

---

## 3. Config 변경

### 3.1 추가 필드

```json
{
  "voice": "Yuna",
  "language": "ko",
  "rate": 200,
  "volume": 50,
  "summary": {
    "maxChars": 200,
    "mode": "first-sentence"
  }
}
```

| 필드 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `language` | string | `"en"` | 번역 언어 코드 (`"ko"`, `"en"`) |

---

## 4. translate.sh 설계

### 4.1 번역 함수

```bash
#!/bin/bash
# Agent Speech Plugin — Translation Helper
# Usage: source translate.sh; MSG=$(translate "Hello")
# Uses Google Translate unofficial free API

translate() {
  local TEXT="$1"
  local TARGET_LANG="${LANGUAGE:-en}"

  # Skip translation if language is "en" or not set
  if [[ "$TARGET_LANG" == "en" ]] || [[ -z "$TARGET_LANG" ]]; then
    echo "$TEXT"
    return 0
  fi

  # Skip if text is empty
  if [[ -z "$TEXT" ]]; then
    echo "$TEXT"
    return 0
  fi

  # URL-encode the text
  local ENCODED
  ENCODED=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$TEXT" 2>/dev/null || echo "")

  if [[ -z "$ENCODED" ]]; then
    echo "$TEXT"
    return 0
  fi

  # Call Google Translate free API (timeout 3s to avoid blocking TTS)
  local TRANSLATED
  TRANSLATED=$(curl -s --max-time 3 \
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${TARGET_LANG}&dt=t&q=${ENCODED}" \
    2>/dev/null | jq -r '.[0][][0]' 2>/dev/null | tr -d '\n' || echo "")

  # Fallback to original text if translation fails
  if [[ -z "$TRANSLATED" ]]; then
    echo "$TEXT"
  else
    echo "$TRANSLATED"
  fi
}

export -f translate
```

### 4.2 타임아웃 전략

- `--max-time 3`: 3초 내 응답 없으면 원문 사용
- TTS는 배경 실행 (`say &`) 이므로 3초 대기는 허용 범위
- 오프라인 시 curl 즉시 실패 → 원문 그대로 읽음

---

## 5. load-config.sh 변경

기존 변수에 `LANGUAGE` 추가:

```bash
# Read language code (en, ko, ...)
_LANG=$(jq -r '.language // empty' "$CONFIG_PATH" 2>/dev/null || echo "")
# Allow only known language codes; default to "en"
case "$_LANG" in
  en|ko) LANGUAGE="$_LANG" ;;
  *) LANGUAGE="en" ;;
esac
export LANGUAGE
```

---

## 6. 훅별 변경

### permission-hook.sh

```bash
source "$(dirname "$0")/translate.sh"
# ...
MSG=$(translate "$MESSAGE")
say -v "$VOICE" -r "$RATE" "$MSG" &
```

### subagent-stop-hook.sh, task-completed-hook.sh

같은 패턴 — `translate "$MESSAGE"` 후 `say`

### notification-hook.sh

```bash
MSG=$(translate "$MESSAGE")
say -v "$VOICE" -r "$RATE" "$MSG" &
```

### stop-hook.sh

요약 추출 후 번역 추가:

```bash
SUMMARY=$(extract_summary "$LAST_TEXT")  # 기존 로직
TRANSLATED=$(translate "$SUMMARY")
say -v "$VOICE" -r "$RATE" "$TRANSLATED" &
```

---

## 7. 성공 기준

- [ ] `"language": "ko"` 설정 시 permission/subagent/task 메세지 한국어
- [ ] "The task has been completed." → 한국어 번역 후 Yuna 음성 안내
- [ ] 오프라인 시 원문 영어 그대로 읽음 (폴백)
- [ ] `"language": "en"` 또는 없을 시 번역 없음 (API 호출 안 함)
- [ ] 번역 실패 시 (API 오류) 원문 폴백
- [ ] stop-hook 요약도 번역됨
- [ ] 캐시 동기화 완료

---

## 8. Risks and Mitigation

| Risk | 대응 |
|------|------|
| Google API 막힘/변경 | 3초 타임아웃 + 원문 폴백 → TTS 항상 작동 |
| 인터넷 없음 | curl 즉시 실패 → 원문 폴백 |
| python3 없음 | URL 인코딩 실패 → 원문 폴백 |
| 번역 품질 낮음 | 고정 메세지는 충분, stop 요약은 수용 가능 수준 |
| 번역 시간 지연 | 3초 max-time, TTS는 백그라운드 실행 |

---

## 9. Implementation Order

1. `translate.sh` 작성
2. `load-config.sh` — `LANGUAGE` 필드 추가
3. `permission-hook.sh` 업데이트
4. `subagent-stop-hook.sh` 업데이트
5. `task-completed-hook.sh` 업데이트
6. `notification-hook.sh` 업데이트
7. `stop-hook.sh` 업데이트
8. `~/.agent-speech/config.json`에 `"language": "ko"` 추가
9. `config.example.json` 업데이트
10. 캐시 동기화
11. 동작 검증

---

## 10. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02-16 | Initial draft (static i18n table) |
| 0.2 | 2026-02-16 | Revised: Google Translate API approach (all hooks + stop-hook) |
