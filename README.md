# Bisue Blog Static — 웹진형 정적 마크다운 블로그 설계 및 구현 명세

GitHub Pages 배포를 위한 **웹진(Webzine) 스타일의 마크다운 기반 정적 블로그** 프로젝트입니다.  
본 저장소의 `docs/` 디렉토리에는 소프트웨어 공학 표준 문서화 방법론(SRS, C4 Model, ADR, 데이터/컴포넌트 명세, WBS)에 따라 작성된 상세 설계 및 구현 계획이 포함되어 있습니다.

---

## 📚 설계 및 구현 계획 문서 목차 (`docs/`)

| 순서 | 문서 파일 | 적용 방법론 | 주요 내용 요약 |
| :---: | :--- | :--- | :--- |
| **01** | [`docs/01-srs-requirements.md`](./docs/01-srs-requirements.md) | **SRS (ISO/IEC/IEEE 29148)** | 사용자 스토리, 기능 요구사항(`FR-CNT`, `FR-MD`, `FR-NAV`, `FR-PAGE`), 비기능 요구사항, 요구사항 추적 매트릭스 |
| **02** | [`docs/02-architecture-and-adr.md`](./docs/02-architecture-and-adr.md) | **C4 Model & ADR** | 시스템 컨텍스트/컨테이너/컴포넌트 다이어그램, 전체 프로젝트 폴더 구조, 7가지 핵심 기술 의사결정 기록(ADR-001 ~ 007) |
| **03** | [`docs/03-data-and-markdown-spec.md`](./docs/03-data-and-markdown-spec.md) | **Data Schema & Pipeline Spec** | 폴더 기반 카테고리 규칙, Zod Frontmatter 스키마, 썸네일 3단계 Fallback 및 120자 본문 평문 추출 알고리즘, 마크다운 확장 플러그인 파이프라인, URL/Base Path 명세 |
| **04** | [`docs/04-ui-ux-and-component-spec.md`](./docs/04-ui-ux-and-component-spec.md) | **Design System & Component Spec** | 라이트 모드 모던 웹진 컬러/타이포그래피(`Pretendard` + `JetBrains Mono`) 토큰, 화면별 와이어프레임, 전체 Astro 컴포넌트 Props 및 동작 명세 |
| **05** | [`docs/05-implementation-plan-wbs.md`](./docs/05-implementation-plan-wbs.md) | **WBS & Verification Plan** | 설치 패키지 명세, Phase 1 ~ Phase 6 단계별 구현 태스크 체크리스트, GitHub Actions 자동 배포 워크플로우, 최종 인수 검증 매트릭스 |

---

## 🎯 핵심 아키텍처 및 결정 사항 요약

1. **기술 스택**: **Astro 5 + TypeScript + Tailwind CSS** (콘텐츠 중심 정적 사이트 생성기)
2. **카테고리 관리**:
   - `src/content/posts/<카테고리>/<슬러그>.md` **1단계 폴더 구조** 기반 자동 분류
   - `src/config/categories.ts`를 통해 한글 표시명(`label`), 설명, 정렬 순서 매핑 지원 (미등록 신규 폴더도 자동 인식)
3. **네비게이션 및 화면 구성**:
   - **상단 헤더 네비게이션 바** (데스크톱 상단 카테고리 메뉴 바 + 모바일 슬라이드 드로어)
   - **홈 화면 (`/`)**: 카테고리별로 최신 글 3개씩 섹션을 나누어 보여주는 **매거진 큐레이션 홈**
   - **목록 화면 (`/category/<category>/`, `/posts/`)**: 데스크톱 3열 카드 그리드, **페이지당 9개** 노출 + 페이지 번호 이동(Pagination)
   - **목록 카드 구성**: 대표 썸네일(16:9) + 카테고리 배지 + 작성일 + 제목 + **본문 텍스트 미리보기(Frontmatter 요약 우선, 미지정 시 본문 평문 120자 자동 추출)**
   - **상세 화면 (`/posts/<category>/<slug>/`)**: 상단 메타 정보(카테고리 배지, 작성일) + 제목 + 마크다운 본문 + **우측 Sticky 목차(TOC, 모바일은 상단 접기)** + **같은 카테고리 내 이전 글 / 다음 글** 이동
4. **썸네일 3단계 Fallback**:
   - `1순위` Frontmatter `thumbnail` 지정 → `2순위` 마크다운 본문 내 첫 번째 이미지 자동 추출 → `3순위` 기본 플레이스홀더 이미지(`/images/default-thumbnail.svg`)
   - 상대 경로 이미지, `public/` 경로, 외부 이미지 URL 모두 지원
5. **마크다운 문법 지원 (검증된 라이브러리 조합)**:
   - 표준 CommonMark + **GFM** (`remark-gfm`: 표, 취소선, 체크리스트, 각주, 자동 링크)
   - **코드 블록 문법 강조 + 복사 버튼** (`astro-expressive-code`)
   - **다이어그램 렌더링** (`mermaid` 공식 패키지 연동)
   - **GitHub 스타일 콜아웃** (`remark-github-blockquote-alert`: `> [!NOTE]`, `> [!TIP]` 등)
   - **원시 HTML 태그 허용** (`rehype-raw`: `<iframe>`, `<details>`, `<kbd>`, `<mark>` 등)
6. **부가 기능 및 배포**:
   - **Pagefind** 기반 정적 키워드 검색 모달 (`Ctrl+K` / 검색 버튼)
   - GitHub Pages 프로젝트 서브 경로(`/bisue-blog-static/`) 호환 설계 및 **GitHub Actions** 자동 배포 워크플로우(`.github/workflows/deploy.yml`)
