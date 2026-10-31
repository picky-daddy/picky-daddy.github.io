# CODEX 작업 지시서 — 눈썰미(nunssulmi) 사이트 1단계

이 문서만 보고 작업하세요. 디자인 계획은 이미 승인됐습니다. **임의로 바꾸지 마세요.**

## 0. 범위

- 작업 폴더: 저장소의 `nunssulmi/` **안에서만**. 저장소 루트의 기존 파일(`index.html`, `privacy.html`, `terms.html`, `uploader.html`)은 절대 건드리지 마세요.
- 이번 작업: **(1) Astro 프로젝트 셋업 + (2) `/records` 페이지 완성 + (3) `CLAUDE.md` 작성**. 홈·서비스·소개 페이지는 만들지 마세요(빈 라우트도 만들지 말 것).
- 끝나면 같은 브랜치에 커밋·푸시하고, 맨 아래 "보고 형식"대로 `nunssulmi/REPORT.md`를 남기세요.

## 1. 스택

- Astro 최신 안정판, TypeScript strict, 정적 출력(`output: 'static'`). UI 프레임워크(React 등) 쓰지 말 것. 필터링은 바닐라 JS `<script>` 하나.
- 배포: Vercel, Root Directory = `nunssulmi/` (설정 파일만 준비, 배포는 하지 않음)
- `nunssulmi/.gitignore`에 `node_modules`, `dist`, `.astro` 포함
- 폰트는 npm으로 받아 **직접 호스팅**, unicode-range 분할된 것 사용
  - 제목: `@fontsource/noto-serif-kr` 700, 900
  - 본문: `pretendard` 패키지의 dynamic-subset (400, 600)
  - 두 폰트 모두 SIL OFL 1.1. 외부 CDN 폰트 요청 금지
- 차트 라이브러리 금지. 월별 막대는 인라인 SVG로 직접 그림

## 2. 폴더 구조

```
nunssulmi/
├── CLAUDE.md
├── astro.config.mjs
├── package.json
├── scripts/convert.py           ← 이미 있음 (수정 금지)
├── src/
│   ├── data/activities.json     ← 이미 있음 (387건, 수정 금지)
│   ├── lib/stats.ts             ← 통계 계산 함수 (전부 여기서)
│   ├── content/copy.ts          ← 모든 카피 문자열
│   ├── styles/tokens.css        ← 색·폰트·간격 변수
│   ├── layouts/Base.astro
│   ├── components/              ← 섹션 단위로 분리
│   └── pages/records.astro
└── public/
```

## 3. 디자인 토큰 (승인됨)

```css
--ink:      #111111;  /* 본문·제목 */
--paper:    #FFFFFF;  /* 기본 배경 */
--paper-2:  #EEF0EC;  /* 보조 배경(필터 바, 교대 섹션) */
--muted:    #5A5F58;  /* 캡션, 표 머리 */
--pass:     #0B6E4F;  /* CTA 버튼, 링크, 선정 표시 */
--reject:   #C4122F;  /* 취소선/제외 표시에만. 이번 페이지에선 거의 안 씀 */
--rule:     #CDD1CA;  /* 1px 구분선 */
--placeholder-bg: #FFE14D; /* [[ ]] 표시용, 점선 테두리 */
--font-head: 'Noto Serif KR', serif;
--font-body: 'Pretendard Variable', Pretendard, system-ui, sans-serif;
```

- 본문 17px(모바일) / 18px(≥768px), line-height 1.75, 텍스트 최대폭 34em
- 숫자는 `font-variant-numeric: tabular-nums`
- 다크모드 없음. 라이트 고정

## 4. 반드시 지킬 디자인 규칙

1. **모바일 우선.** 360px 폭 기준으로 먼저 만들고 넓혀갈 것. 가로 스크롤 금지
2. **좌측 정렬.** 중앙 정렬 문단 금지
3. **카드·그림자·둥근 모서리 금지.** 구획은 1px `--rule` 가로선과 표로만
4. 제목 위 대문자/작은 라벨(eyebrow) 금지. 제목은 문장 하나
5. 가운뎃점(·)으로 이은 메타 문자열 금지. 정보는 표 칸이나 줄바꿈으로 분리
6. 버튼·링크 텍스트 뒤 화살표(→, ›) 금지. 동사형 텍스트로("진단서 받기", "조회하기")
7. 페이드업 등 등장 애니메이션 금지. **이 페이지에는 모션 0**
8. 크림색 배경, 테라코타 계열 색 금지
9. 아이콘·일러스트·그라데이션 금지
10. 모바일 하단 고정 CTA 바: 높이 56px, 배경 `--pass`, 흰 글자 "무료 진단서 받기", 링크는 `/service/diagnosis` (아직 없는 페이지여도 링크만 둠). 데스크톱(≥768px)에서는 헤더 우측 텍스트 버튼으로

## 5. `/records` 명세

### 카피 (copy.ts에 넣을 것. 숫자 자리는 계산값으로 치환)

```
제목:   {total}건, 전부 공개합니다
본문:   {firstYear}년 {firstMonth}월부터 {months}개월 동안 직접 다닌 곳입니다.
        숨길 이유가 없어서 그대로 올립니다.
안내:   금액은 싣지 않았습니다. 업체명·업종·플랫폼·시기만 공개합니다.
```

### 통계 — `src/lib/stats.ts`에서 JSON으로 계산 (하드코딩 금지)

- `total`, 기간(첫 ym ~ 마지막 ym, 개월 수), 유형별 건수·비중, 플랫폼별 건수, 월별 건수
- 표시 순서: 유형·플랫폼은 건수 내림차순, 월은 시간순
- 비중은 소수점 1자리 %
- 같은 업체명 재방문 수는 계산만 해두고 이번엔 표시하지 않음

### 화면 구성 (위→아래)

1. 제목 + 본문 (제목은 `--font-head` 900)
2. **요약 통계**
   - 유형별: 가로 막대 목록 (라벨 | 막대 | 건수 | 비중). 막대 색 `--ink` 한 가지
   - 플랫폼별: 같은 형식
   - 월별 추이: 인라인 SVG 세로 막대 13개, 색 `--ink` 한 가지, 각 막대 위 건수, 아래 `25.08` 형식 라벨. `role="img"` + 요약 `aria-label`. 360px에서 잘리지 않게 viewBox로 반응형
3. **필터 바** (`--paper-2` 배경, 스크롤 시 상단 sticky)
   - 유형 select / 플랫폼 select / 연월 select / 검색 input(업체명 부분일치, 공백 무시)
   - 옵션은 JSON에서 생성. 각 옵션에 건수 표시 예: `맛집 (250)`
   - 결과 건수 한 줄: "{n}건 표시 중" + "필터 초기화" 텍스트 버튼
   - 필터 상태를 URL 쿼리(`?type=맛집&platform=레뷰`)에 반영 → 공유·뒤로가기 가능
4. **목록**
   - 기본 정렬: 최신 연월 먼저, 같은 달은 id 내림차순
   - ≥768px: 표 (연월 | 업종 | 업체명 | 플랫폼), 헤더 sticky, 행 구분 1px `--rule`
   - <768px: 줄 친 2줄 목록 (1줄: 업체명 굵게 / 2줄: 연월, 업종, 플랫폼을 `--muted`로 칸 띄워 나열 — 가운뎃점 금지). 카드 금지
   - 387행 전부 서버에서 렌더(HTML에 포함) → JS는 `hidden` 토글만. JS 꺼져도 전체 목록 보임
   - 결과 0건이면 "조건에 맞는 기록이 없습니다." + 초기화 버튼
5. 페이지 하단 CTA 블록: "맞는지 아닌지, 진단서 한 장 받아보고 정하세요" + 버튼 "무료 진단서 신청" (`--pass`)

### 공통 레이아웃 (Base.astro)

- 헤더: 좌측 워드마크 "눈썰미"(텍스트, `--font-head` 900), 우측 CTA(데스크톱)
- 푸터: 최소한으로 `[[ 사업자 정보 ]]`, `[[ 연락처 ]]` 플레이스홀더
- `[[ ]]` 플레이스홀더 컴포넌트: `--placeholder-bg` 배경 + 점선 테두리로 눈에 띄게
- `<html lang="ko">`, 메타 title/description, viewport

## 6. 품질 기준 (모두 확인하고 REPORT에 결과 기록)

- `npm run build` 성공, 경고 없음
- `astro check` 타입 에러 0
- 빌드 결과에서 아래 수치가 **계산으로** 나오는지 확인 (stats.ts 단위 테스트 또는 빌드 스크립트 assert):
  - total 387 / 기간 2025-08 ~ 2026-08, 13개월
  - 유형: 맛집 250, 여가 42, 뷰티 27, 제품 26, 수익 23, 카페 14, 숙박 5
  - 플랫폼: 디너의여왕 156, 레뷰 148, 슈퍼멤버스 79, 리뷰노트 4
  - 월별: 7,16,33,49,60,36,18,15,39,36,26,28,24
  - 방문형(제품·수익 제외) 338
- Playwright로 360px·1280px 스크린샷 각 1장 → `nunssulmi/report/` 에 저장
  - 필터(유형=수익) 적용 시 23건 표시되는지 자동 확인
- Lighthouse 모바일 성능 90 이상 목표 (가능하면 측정값 기록)
- 가로 스크롤 없음(360px), 모든 텍스트 대비 WCAG AA

## 7. CLAUDE.md 내용 (nunssulmi/CLAUDE.md)

아래를 요약 수록:
- 톤: 평서문, 짧게. 형용사보다 숫자. 못 하는 걸 먼저 말한다. 과장 금지("1위 보장", "매출 3배" 류). 존댓말, "사장님" 호칭, 느낌표 최소화
- 위 3장(토큰)·4장(규칙) 전체
- 원칙: 숫자는 전부 activities.json에서 계산 / 거르는 것을 먼저 보여준다 / 선 외 장식 없음 / 링크는 검증 가능한 곳 / CTA는 무료 진단서 하나
- 모션은 사이트 전체에서 홈 히어로 한 곳(초점 맞춤, 0.6초, reduced-motion 시 끔)만 허용 — 이번 작업에선 구현하지 않음
- 데이터 갱신: `python3 scripts/convert.py 활동목록.xlsx src/data/activities.json` 후 push
- 공개 금지: 금액(협찬가액·원고료 총액), 비고, 재방문의사

## 8. 보고 형식 (`nunssulmi/REPORT.md`)

```
## 결과
- 빌드: 성공/실패
- astro check: 에러 n
- 수치 검증: 통과/실패 (실패 항목)
- 필터 테스트: 통과/실패
- Lighthouse 모바일: 성능 n / 접근성 n (측정 못 했으면 사유)
## 스크린샷
- report/records-360.png, report/records-1280.png
## 지시서와 다르게 한 것 (이유)
## 남은 [[ ]] 플레이스홀더 목록
## 실행 방법
```
