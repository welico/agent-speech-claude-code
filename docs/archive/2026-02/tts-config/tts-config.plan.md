# tts-config Planning Document

> **Summary**: 사용자가 TTS 언어/목소리/속도를 설정할 수 있는 config 파일을 도입하고, 응답 요약 방식을 개선한다.
>
> **Project**: agent-speech-claude-code
> **Version**: 0.2.0
> **Author**: welico
> **Date**: 2026-02-16
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

현재 모든 훅 스크립트가 `Samantha` 음성과 200wpm 속도로 하드코딩되어 있다. 한국어 사용자는 한국어 목소리(예: Yuna)로 안내받기를 원하며, 요약 방식도 180자 단순 잘라내기보다 더 자연스러운 형태가 필요하다.

### 1.2 Motivation

| 현재 문제 | 개선 후 |
|----------|--------|
| Samantha(영어) 목소리 고정 | 사용자 설정 목소리 |
| 200wpm 속도 고정 | 사용자 설정 속도 |
| 180자 단순 잘라내기 | 첫 완성 문장 추출 |
| 모든 스크립트 하드코딩 | config 파일 1곳 수정으로 전체 반영 |

### 1.3 macOS 한국어 지원 음성 (확인됨)

```
Yuna                ko_KR    안녕하세요. 제 이름은 유나입니다.
Eddy (Korean)       ko_KR
Flo (Korean)        ko_KR
Sandy (Korean)      ko_KR
Shelley (Korean)    ko_KR
Reed (Korean)       ko_KR
```

---

## 2. Scope

### 2.1 In Scope

| 기능 | 설명 |
|------|------|
| Config 파일 | `~/.agent-speech/config.json` 생성/읽기 |
| 음성 설정 | `voice` 필드 (예: "Yuna", "Samantha") |
| 속도 설정 | `rate` 필드 (wpm, 기본 200) |
| 요약 방식 개선 | 첫 완성 문장 추출 (최대 200자) |
| 공통 설정 로더 | `load-config.sh` — 모든 훅에서 `source` |
| 설정 검증 | 잘못된 음성명 → 기본값 폴백 |

### 2.2 Out of Scope

- AI API 호출 요약 (외부 의존성, 별도 feature로)
- UI 설정 화면
- 훅별 다른 설정 (단일 전역 설정)
- Windows/Linux 지원

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | 요구사항 | 우선순위 |
|----|---------|---------|
| FR-01 | `~/.agent-speech/config.json` 읽어 voice/rate 적용 | High |
| FR-02 | config 없으면 기본값 (Samantha, 200) 사용 | High |
| FR-03 | 잘못된 voice명 → 기본값 폴백, 계속 진행 | High |
| FR-04 | 공통 config 로더 `load-config.sh` — 모든 훅에서 사용 | High |
| FR-05 | 응답 요약: 첫 완성 문장 추출 (최대 200자) | Medium |
| FR-06 | 마크다운 제거 후 자연스러운 텍스트 추출 | Medium |
| FR-07 | config 파일 예시 `config.example.json` 제공 | Low |

### 3.2 Non-Functional Requirements

| 항목 | 기준 |
|------|------|
| 폴백 보장 | config 파일 없어도 TTS 항상 동작 |
| 성능 | config 로드 < 50ms |
| 호환성 | 기존 훅 동작 무변경 |

---

## 4. Config File Spec

### 4.1 위치

```
~/.agent-speech/config.json
```

### 4.2 스키마

```json
{
  "voice": "Yuna",
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
| `voice` | string | `"Samantha"` | macOS 음성 이름 |
| `rate` | number | `200` | 발화 속도 (wpm) |
| `volume` | number | `50` | 볼륨 (0-100) |
| `summary.maxChars` | number | `200` | 최대 발화 글자 수 |
| `summary.mode` | string | `"first-sentence"` | `"first-sentence"` or `"truncate"` |

---

## 5. Architecture

### 5.1 파일 구조 변경

```
hooks/
├── hooks.json
├── load-config.sh          ← 신규: 공통 config 로더
├── stop-hook.sh            ← 수정: load-config.sh 사용
├── notification-hook.sh    ← 수정: load-config.sh 사용
├── permission-hook.sh      ← 수정: load-config.sh 사용
├── subagent-stop-hook.sh   ← 수정: load-config.sh 사용
└── task-completed-hook.sh  ← 수정: load-config.sh 사용
```

### 5.2 load-config.sh 역할

```bash
# 호출 방법
source "$(dirname "$0")/load-config.sh"
# 이후 $VOICE, $RATE, $VOLUME 변수 사용 가능
```

### 5.3 요약 개선 로직 (first-sentence mode)

```
1. 마크다운 코드블록 제거 (``` ... ```)
2. 인라인 코드 제거 (`...`)
3. 마크다운 기호 제거 (#, *, _, |, >)
4. 줄바꿈 → 공백
5. 첫 완성 문장 추출 (. / ? / ! 으로 끝나는 첫 문장)
6. 문장 없으면 maxChars까지 단순 잘라내기
```

---

## 6. Summary Mode 비교

| 모드 | 방식 | 예시 |
|------|------|------|
| `truncate` | 앞 N자 그대로 | "현재 설정 확인됨 5개 훅 등록..." |
| `first-sentence` | 첫 완성 문장 | "현재 설정이 확인되었습니다." |

---

## 7. Risks and Mitigation

| Risk | 대응 |
|------|------|
| voice명 오타 → `say` 실패 | voice 검증 후 Samantha 폴백 |
| config 파일 없음 | 기본값 사용, exit 0 보장 |
| 한국어 텍스트 + 영어 목소리 | 사용자가 Yuna 설정하면 해결 |
| 첫 문장 추출 실패 (문장 부호 없음) | truncate 모드로 폴백 |

---

## 8. Success Criteria

- [ ] `~/.agent-speech/config.json`에서 voice/rate 읽어 TTS 적용
- [ ] config 없어도 기본값으로 동작
- [ ] `load-config.sh` 공통 로더 모든 훅에 적용
- [ ] first-sentence 요약 모드 동작
- [ ] `config.example.json` 한국어 설정 예시 포함
- [ ] 캐시 동기화 완료

---

## 9. Implementation Order

1. `load-config.sh` 작성
2. `stop-hook.sh` 업데이트 (config + first-sentence 요약)
3. 나머지 4개 훅 업데이트 (config 반영)
4. `config.example.json` 작성
5. `~/.agent-speech/config.json` 사용자용 기본 설정 생성
6. 캐시 동기화
7. 동작 검증

---

## 10. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02-16 | Initial draft |
