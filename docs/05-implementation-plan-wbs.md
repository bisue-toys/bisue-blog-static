# 05. 단계별 구현 계획 및 작업 분류 체계 (WBS & Implementation Plan)

> **문서 버전**: 1.0.0  
> **목적**: 앞서 정의한 요구사항(SRS), 아키텍처(ADR), 데이터 스키마, UI/UX 명세를 바탕으로 실제 구현을 수행하기 위한 단계별 작업 분류 체계(WBS), 설치할 패키지 목록, 파일별 구현 순서, 그리고 검증 시나리오를 상세히 명시한다.

---

## 1. 작업 분류 체계 다이어그램 (WBS Overview)

전체 개발 공정은 **총 6개 Phase (22개 세부 작업 단위)**로 구성되며, 각 Phase가 끝날 때마다 빌드 및 동작 검증을 수행한다.

```mermaid
flowchart LR
    P1["Phase 1\n프로젝트 초기화 및\n환경/설정 구축"]
    P2["Phase 2\n콘텐츠 스키마 및\n마크다운 파이프라인"]
    P3["Phase 3\n공통 레이아웃 및\n홈/목록 화면 구현"]
    P4["Phase 4\n게시글 상세 화면 및\nTOC/Mermaid/네비게이션"]
    P5["Phase 5\n정적 검색(Pagefind) 및\n샘플 콘텐츠 작성"]
    P6["Phase 6\nGitHub Actions 배포 및\n최종 통합 검증"]

    P1 --> P2 --> P3 --> P4 --> P5 --> P6
```

---

## 2. 설치 패키지 및 버전 명세 (`package.json`)

직접 파서나 복잡한 기능을 구현하지 않고 검증된 공식/표준 라이브러리를 조합하기 위해 아래 패키지들을 설치한다.

### 2.1 Dependencies & DevDependencies 목록

| 구분 | 패키지명 | 용도 |
| :--- | :--- | :--- |
| **Core Framework** | `astro` (`^5.x`) | 정적 사이트 생성기 코어 및 Content Collections API |
| **Styling** | `tailwindcss` (`^4.x` 또는 `^3.4.x`), `@tailwindcss/typography` | 유틸리티 스타일링 및 마크다운 본문(`prose`) 타이포그래피 스타일링 |
| **Code Highlighting** | `astro-expressive-code` | 코드 블록 문법 강조(Shiki), 복사 버튼, 파일명 헤더 프레임 자동 생성 |
| **Markdown Plugins** | `remark-gfm` | GFM(표, 취소선, 체크리스트, 각주, 자동 링크) 지원 |
| **Markdown Plugins** | `remark-github-blockquote-alert` | GitHub 스타일 콜아웃(`> [!NOTE]`, `> [!TIP]` 등) 렌더링 |
| **Markdown Plugins** | `rehype-raw` | 마크다운 내 원시 HTML 태그(`<iframe>`, `<details>`, `<kbd>`, `<mark>` 등) 허용 |
| **AST Utilities** | `unist-util-visit` | Mermaid 코드 블록 보존 및 이미지 Base Path 자동 보정용 경량 AST 순회 유틸 |
| **Diagrams** | `mermaid` | ```` ```mermaid ```` 코드 블록을 SVG 다이어그램으로 변환하는 공식 라이브러리 |
| **Static Search** | `pagefind` | 빌드 완료 후 `dist/` 폴더를 인덱싱하여 정적 키워드 검색 UI 및 인덱스 생성 |
| **TypeScript** | `typescript`, `@types/node` | 엄격한 타입 검사 및 Node.js 경로 처리 |

### 2.2 `package.json` 스크립트 명세

```json
{
  "name": "bisue-blog-static",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build && npx pagefind --site dist",
    "preview": "astro preview",
    "astro": "astro"
  }
}
```

---

## 3. Phase별 상세 구현 계획 (Step-by-Step Tasks)

---

### Phase 1: 프로젝트 초기화 및 전역 설정 구축

#### 목표
Astro + TypeScript + Tailwind CSS 기반 프로젝트 뼈대를 생성하고, GitHub Pages 서브 경로(`/bisue-blog-static`) 및 사이트/카테고리 설정 파일, 기본 에셋을 준비한다.

#### 세부 작업 체크리스트
- [x] **Task 1.1: 프로젝트 초기화 및 패키지 설치**
  - `package.json`, `tsconfig.json`(`@/*` → `./src/*` 경로 별칭 포함), `.gitignore` 생성
  - 위 §2.1에 명시된 의존성 패키지 일괄 설치
- [x] **Task 1.2: 사이트 및 카테고리 설정 파일 작성**
  - `src/config/site.ts`: 사이트 타이틀, 설명, `basePath`(`'/bisue-blog-static'`), `homePostsPerCategory: 3`, `postsPerPage: 9`, `excerptLength: 120` 정의
  - `src/config/categories.ts`: 기본 카테고리 매핑(`tech`, `essay`, `review` 등) 및 `CategoryMeta` 인터페이스 정의
- [x] **Task 1.3: Base Path 유틸리티 작성**
  - `src/lib/url.ts`: `withBase(path)` 함수 구현 (`import.meta.env.BASE_URL`을 안전하게 결합하고 외부 URL은 그대로 통과)
- [x] **Task 1.4: 기본 정적 에셋 생성**
  - `public/favicon.svg`: 웹진 심볼 파비콘 생성
  - `public/images/default-thumbnail.svg`: 썸네일 미지정 및 본문 이미지 부재 시 표시할 깔끔한 웹진풍 SVG 플레이스홀더(16:9 비율) 생성

---

### Phase 2: 콘텐츠 스키마 및 마크다운 파이프라인 구현

#### 목표
`src/content/posts/<category>/<slug>.md` 폴더 구조를 스캔하는 Content Collection을 구성하고, 모든 마크다운 확장 문법(GFM, 코드 하이라이팅, Mermaid, 원시 HTML, 콜아웃)과 썸네일/미리보기 추출 로직을 완성한다.

#### 세부 작업 체크리스트
- [x] **Task 2.1: Astro Content Collections 스키마 정의**
  - `src/content.config.ts` 작성: `glob({ pattern: '**/*.md', base: './src/content/posts' })` 로더 및 Zod 스키마(`title`, `pubDate`, `updatedDate`, `description`, `thumbnail`, `thumbnailAlt`, `draft`) 정의
- [x] **Task 2.2: 마크다운 본문 파싱 및 추출 유틸리티 구현**
  - `src/lib/markdown-extract.ts` 작성:
    1. `extractFirstImage(markdownBody)`: 코드 블록을 제외한 본문에서 첫 번째 `![alt](src)` 또는 `<img src="...">` 경로 추출
    2. `extractExcerpt(markdownBody, maxLength = 120)`: 코드 블록, Mermaid, HTML 태그, 이미지, 마크다운 기호를 모두 제거한 순수 평문 추출 및 120자 말줄임(`...`) 처리
- [x] **Task 2.3: 게시글 조회·카테고리 매핑·썸네일 Fallback 도메인 로직 구현**
  - `src/lib/posts.ts` 작성:
    1. `getAllPosts()`: 프로덕션 시 `draft: false` 필터링, 작성일(`pubDate`) 최신순 정렬, `ProcessedPost` 객체 배열 반환
    2. `resolveCategory(categorySlug)`: `src/config/categories.ts`와 매칭하되 미등록 폴더명도 자동으로 표시명(`label: categorySlug`)으로 변환
    3. `resolveThumbnail(entry)`: 1순위 Frontmatter `thumbnail` → 2순위 본문 첫 번째 이미지(로컬 상대 경로 에셋 또는 URL) → 3순위 `/images/default-thumbnail.svg`
    4. `getCategoriesWithCount()`: 게시글이 있는 모든 카테고리 목록과 카테고리별 게시글 개수 반환
    5. `getPostsByCategory(categorySlug)`: 특정 카테고리의 게시글 목록 반환
    6. `getAdjacentPosts(categorySlug, currentSlug)`: **같은 카테고리 내** 이전 글(`prevPost`) / 다음 글(`nextPost`) 반환
- [x] **Task 2.4: `astro.config.mjs` 마크다운 확장 파이프라인 설정**
  - `astro-expressive-code` 통합 등록 (코드 블록 테마, 복사 버튼, 파일명 프레임 활성화)
  - `remark-gfm`, `remark-github-blockquote-alert` 등록
  - `remarkMermaidPre`: ```` ```mermaid ```` 코드 블록을 `<pre class="mermaid">` HTML 노드로 변환하여 Expressive Code가 일반 코드로 처리하지 않도록 처리
  - `rehype-raw`: 마크다운 내부 원시 HTML 태그(`<iframe>`, `<details>`, `<kbd>`, `<mark>` 등) 허용
  - `rehypeBaseUrl`: 마크다운 내부 `/images/...` 경로에 GitHub Pages `base` 경로 자동 프리픽스

---

### Phase 3: 공통 레이아웃, 네비게이션, 홈 및 목록 화면 구현

#### 목표
라이트 모드 모던 웹진 디자인 시스템을 적용하고, 상단 고정 카테고리 메뉴, 매거진 큐레이션 홈 화면(`/`), 카테고리별 목록 화면(`/category/[category]/[...page]`), 전체 글 목록 화면(`/posts/[...page]`)을 구현한다.

#### 세부 작업 체크리스트
- [x] **Task 3.1: 전역 스타일 및 타이포그래피 설정**
  - `src/styles/global.css` 작성:
    - `Pretendard Variable` 및 `JetBrains Mono` 웹폰트 로드
    - 오프화이트 배경(`#FAFAFA`), 웹진 카드 스타일, 마크다운 `prose` 커스텀 스타일(표, 체크리스트, 인용문, GitHub Alert 5종 색상, 반응형 `iframe`, `<details>`, `<kbd>`, `<mark>`) 정의
- [x] **Task 3.2: 기본 레이아웃 및 상단/하단 공통 컴포넌트 구현**
  - `src/layouts/BaseLayout.astro`: HTML `<head>`, SEO/OpenGraph 메타 태그, Header, Main, Footer, SearchModal 배치
  - `src/components/common/Header.astro`:
    - 데스크톱 상단 카테고리 메뉴 바 + 현재 카테고리 Active 표시 + 검색 버튼
    - 모바일 햄버거 버튼 및 슬라이드 드로어 카테고리 메뉴
  - `src/components/common/Footer.astro`: 심플한 웹진 푸터
- [x] **Task 3.3: 카드, 섹션, 페이지네이션 컴포넌트 구현**
  - `src/components/post/PostCard.astro`: 16:9 대표 썸네일 + 카테고리 배지 + 작성일 + 제목(2줄) + 120자 본문 미리보기(3줄) 카드
  - `src/components/post/CategorySection.astro`: 홈 화면용 카테고리 헤더 + 최신 글 3개(3열 그리드) + `'전체 N개 글 보기 →'` 링크
  - `src/components/common/Pagination.astro`: 페이지 번호(이전, 1, 2, 3..., 다음) 네비게이션
- [x] **Task 3.4: 홈 및 목록 라우트 페이지 구현**
  - `src/pages/index.astro`: 카테고리별 최신 글 3개씩 섹션을 나누어 보여주는 매거진 큐레이션 홈
  - `src/pages/category/[category]/[...page].astro`: `getStaticPaths()`와 `paginate()`를 사용하여 각 카테고리별 9개 단위 페이지네이션 목록 생성
  - `src/pages/posts/[...page].astro`: 전체 게시글 9개 단위 페이지네이션 목록 생성
  - `src/pages/404.astro`: 웹진 스타일 404 안내 페이지

---

### Phase 4: 게시글 상세 화면 및 TOC / Mermaid / 이전·다음 글 구현

#### 목표
게시글 상세 화면(`/posts/[category]/[slug]`)을 구현하고, 우측 Sticky(모바일은 상단 접이식) 목차(TOC), Mermaid 다이어그램 클라이언트 렌더링, 동일 카테고리 내 이전/다음 글 네비게이션을 완성한다.

#### 세부 작업 체크리스트
- [x] **Task 4.1: 목차(`TableOfContents.astro`) 컴포넌트 구현**
  - Astro `render()`에서 반환된 `headings`(`h2`, `h3`)를 받아 데스크톱 우측 Sticky 사이드바 및 모바일 상단 `<details>` 아코디언 목차 렌더링
  - 스크롤 시 현재 읽고 있는 소제목 활성화(`IntersectionObserver`) 스크립트 추가
- [x] **Task 4.2: 이전 글 / 다음 글(`PostNavigation.astro`) 컴포넌트 구현**
  - 같은 카테고리 내 작성일 기준 이전 글 / 다음 글 이동 카드 및 `'카테고리 목록으로 돌아가기'` 버튼 구현
- [x] **Task 4.3: Mermaid 다이어그램 초기화(`MermaidInit.astro`) 컴포넌트 구현**
  - 본문 내 `<pre class="mermaid">` 존재 여부를 감지하여 존재할 때만 `mermaid` 라이브러리를 동적 로드하고 SVG로 변환
- [x] **Task 4.4: 상세 레이아웃 및 상세 라우트 페이지 구현**
  - `src/layouts/PostDetailLayout.astro`: 상단 메타(카테고리 배지, 작성일, 제목) + 본문(`data-pagefind-body` 속성 부여) + 우측 TOC + 하단 이전/다음 글 배치
  - `src/pages/posts/[category]/[slug].astro`: 모든 게시글에 대한 정적 경로(`getStaticPaths`) 생성 및 렌더링

---

### Phase 5: 정적 검색(Pagefind) 연동 및 검증용 샘플 마크다운 작성

#### 목표
Pagefind 기반 정적 키워드 검색 모달을 연동하고, 모든 요구사항(카테고리 분류, 썸네일 3단계 Fallback, 120자 미리보기, 표/코드/Mermaid/HTML 등 모든 마크다운 문법, 페이지네이션)을 즉시 확인할 수 있는 풍부한 샘플 게시글들을 작성한다.

#### 세부 작업 체크리스트
- [x] **Task 5.1: `SearchModal.astro` 구현**
  - 헤더의 검색 버튼 또는 `Ctrl+K` / `Cmd+K` 입력 시 열리는 `<dialog>` 모달 구현
  - `${withBase('/pagefind/pagefind-ui.js')}` 연동 및 한국어 검색 결과 표시 스타일링
- [x] **Task 5.2: 카테고리별 샘플 마크다운(`.md`) 작성**
  - `src/content/posts/tech/`:
    - **모든 마크다운 문법 종합 데모 글** (GFM 표, 체크리스트, 각주, 취소선, 코드 블록 하이라이팅, Mermaid 플로우차트/시퀀스 다이어그램, GitHub 콜아웃 5종, `<details>`, `<kbd>`, `<mark>`, `<iframe>` 등 원시 HTML 포함)
    - Frontmatter 썸네일 지정 글 / 본문 첫 이미지 자동 추출 테스트 글 / 이미지 없는 기본 플레이스홀더 테스트 글 포함
  - `src/content/posts/essay/`: 에세이 카테고리 샘플 글 작성
  - `src/content/posts/review/`: 리뷰 카테고리 샘플 글 작성

---

### Phase 6: GitHub Actions 배포 워크플로우 및 최종 통합 검증

#### 목표
GitHub Pages 자동 배포를 위한 `.github/workflows/deploy.yml`을 작성하고, 프로덕션 정적 빌드 및 전체 인수 테스트를 통과한다.

#### 세부 작업 체크리스트
- [x] **Task 6.1: GitHub Actions 배포 워크플로우 작성**
  - `.github/workflows/deploy.yml` 생성:
    - `main` 브랜치 push 또는 수동 실행(`workflow_dispatch`) 시 트리거
    - Node.js 20 환경에서 `npm ci` 및 `npm run build` (Astro 빌드 + Pagefind 인덱싱 포함) 실행
    - `actions/upload-pages-artifact@v3` 및 `actions/deploy-pages@v4`로 GitHub Pages에 자동 배포
- [x] **Task 6.2: 정적 빌드 및 품질 검증**
  - `npm run build` 실행하여 TypeScript 타입 에러(`astro check`), 마크다운 파싱 에러, Pagefind 인덱싱 에러가 0건인지 확인
  - 생성된 `dist/` 산출물의 라우트 구조 및 서브 경로(`/bisue-blog-static/...`) 링크 무결성 검증

---

## 4.GitHub Actions 워크플로우 명세 (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build Astro site & Pagefind search index
        env:
          SITE_URL: https://${{ github.repository_owner }}.github.io
          SITE_BASE: /${{ github.event.repository.name }}
        run: npm run build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

> **장점**: 위 워크플로우의 `env` 설정(`SITE_URL`, `SITE_BASE`) 덕분에 향후 GitHub 저장소 이름을 변경하더라도 코드 수정 없이 자동으로 `https://<유저명>.github.io/<저장소명>/` 경로에 맞춰 빌드 및 배포된다.

---

## 5. 최종 인수 검증 체크리스트 (Verification Matrix)

구현 완료 후 다음 항목을 전수 검증한다.

| 검증 번호 | 검증 항목 | 기대 결과 (Pass 기준) |
| :--- | :--- | :--- |
| **V-01** | 폴더 기반 카테고리 자동 인식 | `src/content/posts/<카테고리>/` 아래에 새 폴더와 `.md` 파일을 추가하면 상단 메뉴와 홈 섹션에 즉시 반영되는가? |
| **V-02** | 상단 카테고리 메뉴 이동 | 상단 메뉴(및 모바일 드로어)에서 카테고리를 클릭하면 `/category/<카테고리>/` 목록 화면으로 정확히 이동하는가? |
| **V-03** | 홈 화면 매거진 큐레이션 | 홈 화면(`/`)에서 각 카테고리별로 최신 글이 3개씩 3열 그리드로 구분되어 노출되며 `'더보기'` 링크가 동작하는가? |
| **V-04** | 목록 카드 썸네일 3단계 Fallback | ① Frontmatter 썸네일 지정 글, ② 본문 첫 이미지 자동 추출 글, ③ 이미지 없는 기본 플레이스홀더 글이 모두 정상 표시되는가? |
| **V-05** | 목록 카드 120자 본문 미리보기 | Frontmatter 요약이 없을 때 본문의 마크다운 기호/코드/HTML이 제거된 순수 텍스트 120자 미리보기가 깔끔하게 노출되는가? |
| **V-06** | 상세 화면 마크다운 전체 문법 | 상세 화면에서 제목, 본문, GFM 표/체크리스트/각주, 코드 블록 하이라이팅+복사 버튼, Mermaid 다이어그램, GitHub 콜아웃, 원시 HTML 태그가 모두 정상 렌더링되는가? |
| **V-07** | 상세 화면 TOC 및 이전/다음 글 | 우측 Sticky(모바일 상단 접기) 목차 클릭 시 해당 소제목으로 이동하며, 하단 이전/다음 글이 같은 카테고리 기준으로 동작하는가? |
| **V-08** | 서브 경로(`basePath`) 및 정적 검색 | `/bisue-blog-static/` 서브 경로 환경에서 이미지, 링크, Pagefind 키워드 검색이 404 없이 동작하는가? |
