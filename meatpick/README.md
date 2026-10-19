# MeatPick · 로얄팩 골라주는 AI

마트 매대의 포장육(삼겹살 · 목살 · 소고기 척아이롤) 여러 팩을 한 번에 찍으면, 비전 AI가 팩별 지방 분포·근육 형태·마블링을 분석해 순위와 손질 가이드를 보여주는 모바일 웹앱입니다.

## 실행

```bash
cd meatpick
npm install
npm run dev   # http://localhost:3000
```

홈 화면의 **"샘플 이미지로 데모 테스트하기"** 가 켜져 있으면 API 키 없이 전체 화면 흐름을 체험할 수 있습니다.

## 배포 (Vercel)

이 저장소 루트는 GitHub Pages 링크 페이지이므로, Vercel 프로젝트의 **Root Directory를 `meatpick`** 으로 지정해 이 폴더만 배포합니다.
환경 변수는 `.env.example` 참고.

## 구조

| 경로 | 역할 |
|---|---|
| `lib/schema.ts` | zod 스키마. 타입 · 응답 검증 · Gemini responseSchema의 단일 원본 |
| `lib/scoring.ts` | AI 세부 지표 → 총점 · 순위 · 등급 계산 (순위는 AI가 아닌 서버가 결정) |
| `lib/meat.ts` | 부위별 이상 비율 · 가중치 · 라벨 |
| `lib/mock.ts` | 데모 모드 샘플 응답 (`public/samples/*.svg` 일러스트와 좌표 일치) |
| `lib/image.ts` | 업로드 전 브라우저에서 긴 변 1600px JPEG로 축소 |
| `app/api/analyze-meat/route.ts` | 분석 API (P2에서 Gemini 연결) |
| `components/` | 홈 · 스캔 로딩 · 결과(사진 오버레이, 팩 카드, 손질 가이드 시트) |

## 진행 단계

- [x] **P1** 기본 세팅, 스키마, 데모 모드, 전체 UI 흐름
- [ ] **P2** `@google/genai` + `gemini-3.6-flash` 연동, 부위별 프롬프트, 응답 검증·재시도
- [ ] **P3** 상황별 에러 화면 고도화, 오버레이 정교화
- [ ] **P4** 실사진 보정 테스트, 요청 횟수 제한, PWA 아이콘
