# 04. UI/UX 디자인 시스템 및 컴포넌트 명세서 (UI/UX & Component Specification)

> **문서 버전**: 1.0.0  
> **디자인 컨셉**: 라이트 모드 전용 모던 에디토리얼 웹진 (Modern Editorial Webzine - Light Mode Only)  
> **목적**: 색상 토큰, 타이포그래피, 반응형 그리드 규격, 화면별 와이어프레임 레이아웃, 그리고 개별 Astro 컴포넌트의 인터페이스(Props) 및 동작 명세를 정의한다.

---

## 1. 디자인 시스템 토큰 (Design System Tokens)

### 1.1 컬러 팔레트 (Light Mode Editorial Palette)
종이 잡지(Webzine)의 쾌적한 가독성과 모던한 웹 인터페이스를 결합하기 위해 따뜻한 오프화이트 배경과 선명한 차콜 텍스트, 절제된 인디고 블루 포인트 컬러를 사용한다.

| 토큰 역할 | CSS 변수명 / Tailwind 클래스 | HEX 코드 | 적용 대상 |
| :--- | :--- | :--- | :--- |
| **Page Background** | `bg-[#FAFAFA]` (`--bg-page`) | `#FAFAFA` | 사이트 전체 기본 배경 (눈의 피로를 줄이는 오프화이트) |
| **Surface / Card** | `bg-white` (`--bg-surface`) | `#FFFFFF` | 게시글 카드, 상단 고정 헤더(블러 포함), 본문 아티클 컨테이너, 검색 모달 |
| **Subtle Surface** | `bg-zinc-100` (`--bg-muted`) | `#F4F4F5` | 카테고리 비활성 배지, 인용문 배경, 인라인 코드 배경, TOC 활성 배경 |
| **Primary Text** | `text-zinc-900` (`--text-primary`) | `#18181B` | 게시글 제목, 본문 텍스트, 네비게이션 기본 텍스트 |
| **Secondary Text** | `text-zinc-600` (`--text-secondary`) | `#52525B` | 목록 카드의 120자 본문 미리보기(Excerpt), 카테고리 설명문 |
| **Muted Text** | `text-zinc-400` (`--text-muted`) | `#A1A1AA` | 작성일, 구분선 기호, TOC 비활성 항목, 빈 상태 안내 문구 |
| **Primary Accent** | `text-blue-600` / `bg-blue-600` | `#2563EB` | 활성화된 카테고리 메뉴, 카테고리 배지 포인트, 링크 호버, 주요 버튼 |
| **Accent Soft** | `bg-blue-50 text-blue-700` | `#EFF6FF` / `#1D4ED8` | 카드 상단 카테고리 배지 배경 및 텍스트 |
| **Border Default** | `border-zinc-200` | `#E4E4E7` | 헤더 하단 구분선, 카드 테두리, 섹션 구분선, 표(Table) 테두리 |
| **Border Hover** | `border-zinc-400` | `#A1A1AA` | 게시글 카드 마우스 오버 시 테두리 강조 |

---

### 1.2 타이포그래피 (Typography)

- **본문 및 제목 폰트 (`--font-sans`)**: `Pretendard Variable` (CDN 웹폰트 로드 + 시스템 산세리프 Fallback)
  - CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css`
- **코드 블록 및 인라인 코드 폰트 (`--font-mono`)**: `JetBrains Mono` (Google Fonts 로드 + 고정폭 Fallback)

| 요소 | 폰트 크기 (Mobile → Desktop) | 굵기 (Weight) | 행간 (Line Height) | 자간 (Tracking) |
| :--- | :--- | :--- | :--- | :--- |
| **웹진 로고 (Header Brand)** | `1.25rem (20px)` → `1.375rem (22px)` | `800 (ExtraBold)` | `1.2` | `-0.03em` |
| **상세 화면 게시글 제목 (`h1`)** | `1.75rem (28px)` → `2.5rem (40px)` | `800 (ExtraBold)` | `1.3` | `-0.02em` |
| **카테고리 섹션 헤더 (`h2`)** | `1.375rem (22px)` → `1.625rem (26px)` | `700 (Bold)` | `1.35` | `-0.015em` |
| **목록 카드 제목 (`h3`)** | `1.125rem (18px)` → `1.25rem (20px)` | `700 (Bold)` | `1.4` | `-0.01em` |
| **상세 본문 텍스트 (`prose`)** | `1.0rem (16px)` → `1.0625rem (17px)` | `400 (Regular)` | `1.8` (웹진 가독성 최적화) | `-0.005em` |
| **카드 120자 미리보기 (Excerpt)** | `0.9375rem (15px)` | `400 (Regular)` | `1.6` | `0` |
| **메타 정보 (날짜, 배지, TOC)** | `0.8125rem (13px)` | `500 (Medium)` | `1.4` | `0` |

---

### 1.3 반응형 브레이크포인트 및 컨테이너 규격

- **최대 컨테이너 너비**: `max-w-7xl` (`1280px`), 좌우 패딩 `px-4 sm:px-6 lg:px-8`
- **반응형 그리드 기준**:
  - **Mobile (`< 768px`)**: 1열 카드 그리드 (`grid-cols-1`), 상단 햄버거 드로어 메뉴, 상세 페이지 상단 접이식 TOC
  - **Tablet (`768px ~ 1023px`, `md:`)**: 2열 카드 그리드 (`md:grid-cols-2`), 상단 카테고리 메뉴 바 표시
  - **Desktop (`1024px ~ 1279px`, `lg:`)**: 3열 카드 그리드 (`lg:grid-cols-3`), 카드 간격 `gap-6 lg:gap-8`
  - **Wide Desktop (`>= 1280px`, `xl:`)**: 상세 화면에서 본문(`max-w-3xl`, `768px`) + 우측 Sticky 목차 사이드바(`w-64`, `256px`) 2단 배치

---

## 2. 화면별 레이아웃 및 와이어프레임 명세 (Page Wireframes)

### 2.1 매거진 큐레이션 홈 화면 (`src/pages/index.astro`)

상단 고정 헤더 아래에 웹진 타이틀 배너가 위치하고, 이어서 **각 카테고리별 섹션**이 순서대로 나열된다. 각 섹션은 해당 카테고리의 최신 게시글을 **3개(1행 3열)**씩 보여주며 우측 상단의 `'더보기 →'`를 누르면 해당 카테고리 목록 화면으로 이동한다.

```text
+-----------------------------------------------------------------------------------+
| [BISUE WEBZINE]      전체글  |  테크 & 개발  |  에세이 & 단상  |  리뷰     [🔍 검색] |  <-- Sticky Header
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  BISUE WEBZINE                                                                    |  <-- Magazine Banner
|  생각과 기술을 기록하는 디지털 웹진                                                 |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  ■ 테크 & 개발 (Tech)                                       전체 12개 글 보기 →   |  <-- Category Section 1
|  소프트웨어 엔지니어링, 아키텍처, 개발 도구에 관한 기록                             |
|  +-----------------------+  +-----------------------+  +-----------------------+  |
|  | [ 16:9 대표 썸네일 ]   |  | [ 16:9 대표 썸네일 ]   |  | [ 16:9 대표 썸네일 ]   |  |
|  | [테크 & 개발] 2026.11  |  | [테크 & 개발] 2026.10  |  | [테크 & 개발] 2026.10  |  |
|  | 게시글 제목이 최대 두  |  | 게시글 제목이 최대 두  |  | 게시글 제목이 최대 두  |  |
|  | 줄까지 표시됩니다      |  | 줄까지 표시됩니다      |  | 줄까지 표시됩니다      |  |
|  | 본문 텍스트 미리보기가 |  | 본문 텍스트 미리보기가 |  | 본문 텍스트 미리보기가 |  |
|  | 120자까지 추출되어...  |  | 120자까지 추출되어...  |  | 120자까지 추출되어...  |  |
|  +-----------------------+  +-----------------------+  +-----------------------+  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  ■ 에세이 & 단상 (Essay)                                     전체 5개 글 보기 →   |  <-- Category Section 2
|  일상에서 발견한 인사이트와 깊이 있는 생각 정리                                     |
|  +-----------------------+  +-----------------------+  +-----------------------+  |
|  | [ 16:9 대표 썸네일 ]   |  | [ 16:9 대표 썸네일 ]   |  | [ 16:9 대표 썸네일 ]   |  |
|  | ...                   |  | ...                   |  | ...                   |  |
|  +-----------------------+  +-----------------------+  +-----------------------+  |
+-----------------------------------------------------------------------------------+
|  © 2026 BISUE WEBZINE. Powered by Astro & GitHub Pages.                           |  <-- Footer
+-----------------------------------------------------------------------------------+
```

---

### 2.2 카테고리별 게시글 목록 화면 (`src/pages/category/[category]/[...page].astro`)

상단 메뉴에서 특정 카테고리를 클릭했을 때 이동하는 화면이다. 선택된 카테고리가 상단 메뉴에서 활성(파란색 밑줄/볼드) 표시되며, **3열 그리드로 페이지당 9개(3행 × 3열)**의 게시글 카드와 하단 페이지네이션을 표시한다.

```text
+-----------------------------------------------------------------------------------+
| [BISUE WEBZINE]      전체글  | [테크 & 개발] |  에세이 & 단상  |  리뷰     [🔍 검색] |
+-----------------------------------------------------------------------------------+
|  CATEGORY                                                                         |
|  테크 & 개발 (총 12개의 게시글)                                                    |  <-- Category Header
|  소프트웨어 엔지니어링, 아키텍처, 개발 도구에 관한 기록                             |
+-----------------------------------------------------------------------------------+
|  +-----------------------+  +-----------------------+  +-----------------------+  |
|  | [ 16:9 대표 썸네일 ]   |  | [ 16:9 대표 썸네일 ]   |  | [ 16:9 대표 썸네일 ]   |  |
|  | [테크 & 개발] 2026.11  |  | [테크 & 개발] 2026.10  |  | [테크 & 개발] 2026.10  |  |
|  | 게시글 제목 1          |  | 게시글 제목 2          |  | 게시글 제목 3          |  |
|  | 본문 텍스트 미리보기   |  | 본문 텍스트 미리보기   |  | 본문 텍스트 미리보기   |  |
|  | 120자 요약 텍스트...   |  | 120자 요약 텍스트...   |  | 120자 요약 텍스트...   |  |
|  +-----------------------+  +-----------------------+  +-----------------------+  |
|                                                                                   |
|  ( ... 최대 9개 카드: 3행 x 3열 배치 ... )                                         |
|                                                                                   |
|                        [ < 이전 ]   [ 1 ]  [ 2 ]   [ 다음 > ]                      |  <-- Pagination
+-----------------------------------------------------------------------------------+
```

---

### 2.3 게시글 상세 화면 (`src/pages/posts/[category]/[slug].astro`)

게시글의 **제목**, **메타 정보(카테고리 배지, 작성일)**, **마크다운 본문**을 보여주며, 데스크톱에서는 우측에 따라다니는 **Sticky 목차(TOC)**를, 하단에는 **같은 카테고리 내 이전 글 / 다음 글** 이동 카드를 배치한다.

```text
+-----------------------------------------------------------------------------------+
| [BISUE WEBZINE]      전체글  | [테크 & 개발] |  에세이 & 단상  |  리뷰     [🔍 검색] |
+-----------------------------------------------------------------------------------+
|  [테크 & 개발]  ·  2026. 11. 03.                                                   |  <-- Article Header
|  웹진 블로그에서 지원하는 모든 마크다운 문법 가이드                                 |  <-- Title (H1)
+-----------------------------------------------------------------------------------+
|  [모바일/태블릿 전용: ▶ 목차 보기 (클릭 시 펼침)]                                   |
|                                                                                   |
|  +----------------------------------------------------+  +---------------------+  |
|  |                                                    |  | ON THIS PAGE (목차) |  |
|  |  ## 1. 표준 마크다운과 표(Table)                     |  |  • 1. 표준 마크다운 |  |
|  |  본문 단락 텍스트가 쾌적한 줄간격(1.8)으로 렌더링    |  |    - 1.1 표 문법    |  |
|  |  됩니다.                                           |  |  • 2. 코드 하이라이팅|  |  <-- Sticky TOC
|  |                                                    |  |  • 3. Mermaid 차트  |  |      (xl 이상)
|  |  | 항목 | 지원 여부 |                               |  |  • 4. 원시 HTML     |  |
|  |  | :--- | :--- |                                   |  +---------------------+  |
|  |                                                    |                           |
|  |  ## 2. 코드 블록 하이라이팅 (Expressive Code)       |                           |
|  |  +----------------------------------------------+  |                           |
|  |  | example.ts                            [Copy] |  |                           |
|  |  | const blog = "Bisue Webzine";                |  |                           |
|  |  +----------------------------------------------+  |                           |
|  |                                                    |                           |
|  |  ## 3. Mermaid 다이어그램                          |                           |
|  |  [ SVG 다이어그램 자동 렌더링 영역 ]                |                           |
|  |                                                    |                           |
|  +----------------------------------------------------+                           |
|                                                                                   |
|  +----------------------------------------------------+                           |
|  |  [ < 같은 카테고리의 이전 글 ]  |  [ 같은 카테고리의 다음 글 > ]                |  <-- PostNavigation
|  |  마크다운 폴더 구조 설계하기    |  GitHub Pages 배포 자동화 가이드             |
|  +----------------------------------------------------+                           |
|  |                     [ ☰ 테크 & 개발 목록으로 돌아가기 ]                         |
+-----------------------------------------------------------------------------------+
```

---

## 3. 컴포넌트 상세 명세 (Component Specifications)

### 3.1 `Header.astro` (`src/components/common/Header.astro`)
- **역할**: 사이트 최상단 고정(`sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200`) 네비게이션 바 및 모바일 드로어 메뉴를 렌더링한다.
- **Props 인터페이스**:
  ```typescript
  interface Props {
    /** 현재 활성화된 카테고리 슬러그 (카테고리 목록 또는 상세 페이지 진입 시 전달) */
    activeCategory?: string;
    /** 현재 페이지 경로 */
    currentPath?: string;
  }
  ```
- **세부 동작**:
  1. 빌드 타임에 `getCategoriesWithCount()`를 호출하여 게시글이 존재하는 모든 카테고리 목록(정렬 완료됨)을 가져온다.
  2. 데스크톱(`md:flex`): 좌측에 웹진 타이틀 로고(`/`), 중앙에 `홈(/)`, `전체 글(/posts/)`, 그리고 **`카테고리 ▾` 통합 메가 메뉴 버튼**(현재 선택된 카테고리가 있으면 `카테고리 · <카테고리명> ▾`으로 활성 표시)을 두고, 우측 끝에 검색 모달 열기 버튼(`🔍 검색`, 단축키 `Ctrl+K` / `Cmd+K` 지원)을 배치한다.
  3. **`카테고리 ▾` 메가 메뉴 패널**: 클릭 시 상단 헤더 바로 아래로 펼쳐지며, 전체 카테고리를 **다열 반응형 그리드(`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)**로 보여준다. 각 카테고리 카드에는 **카테고리명 + 설명 + 게시글 수 배지(`N편`) + 슬러그**가 표시되며, 카테고리가 수십 개로 늘어났을 때도 즉시 찾을 수 있도록 상단에 **카테고리 이름 실시간 필터 입력창**을 함께 제공한다. 바깥 영역 클릭 또는 `ESC` 키 입력 시 자동으로 닫힌다.
  4. 모바일(`md:hidden`): 햄버거 메뉴 버튼 클릭 시 우측 드로어가 열리며 전체 카테고리 목록(설명 및 게시글 수 포함)을 보여준다.

---

### 3.2 `PostCard.astro` (`src/components/post/PostCard.astro`)
- **역할**: 홈 화면, 카테고리별 목록 화면, 전체 글 목록 화면에서 공통으로 사용하는 웹진 기사 카드 컴포넌트이다.
- **Props 인터페이스**:
  ```typescript
  import type { ProcessedPost } from '@/lib/posts';

  interface Props {
    post: ProcessedPost;
    /** 첫 페이지 상단 카드 이미지 지연 로딩 해제 여부 (기본값: false) */
    eagerLoad?: boolean;
  }
  ```
- **세부 레이아웃 및 스타일 규칙**:
  1. **썸네일 영역**: 상단 `aspect-[16/10]` 또는 `aspect-video` 고정 비율 컨테이너(`overflow-hidden rounded-t-xl bg-zinc-100`).
     - `post.thumbnail.type === 'astro-asset'`이면 Astro `<Image />` 컴포넌트로 최적화된 WebP 이미지를 렌더링한다.
     - `post.thumbnail.type === 'url'`이면 일반 `<img src={post.thumbnail.src} />` 태그로 렌더링한다.
     - 카드 호버 시 이미지가 부드럽게 확대(`group-hover:scale-105 transition-transform duration-300`)된다.
  2. **메타 라인**: 카테고리 배지(`post.categoryLabel`, 클릭 시 카테고리 페이지 이동) + 작성일(`post.formattedDate`).
  3. **제목 영역**: `post.title`을 표시하며 최대 2줄 말줄임(`line-clamp-2`) 처리한다. 호버 시 포인트 컬러(`group-hover:text-blue-600`)로 전환된다.
  4. **본문 미리보기(Excerpt) 영역**: `post.excerpt`(최대 120자)를 표시하며 최대 3줄 말줄임(`line-clamp-3 text-zinc-600 text-sm`)으로 카드 높이를 균일하게 유지한다.

---

### 3.3 `CategorySection.astro` (`src/components/post/CategorySection.astro`)
- **역할**: 매거진 큐레이션 홈 화면(`/`)에서 하나의 카테고리 블록(헤더 + 최신 글 3개 그리드 + 더보기 버튼)을 렌더링한다.
- **Props 인터페이스**:
  ```typescript
  import type { ResolvedCategory, ProcessedPost } from '@/lib/posts';

  interface Props {
    category: ResolvedCategory;
    posts: ProcessedPost[];
  }
  ```
- **세부 동작**:
  - 상단 좌측에 카테고리명(`category.label`)과 설명(`category.description`), 상단 우측에 `더보기 (${category.count}개의 글) →` 링크(`category.url`)를 표시한다.
  - 하단에 `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` 그리드로 최대 `siteConfig.homePostsPerCategory`(기본 3개)의 `<PostCard />`를 배치한다.

---

### 3.4 `TableOfContents.astro` (`src/components/post/TableOfContents.astro`)
- **역할**: 게시글 상세 화면에서 마크다운 헤딩(`h2`, `h3`)을 기반으로 목차를 생성하고 스크롤 위치에 따라 현재 읽고 있는 섹션을 하이라이트한다.
- **Props 인터페이스**:
  ```typescript
  import type { MarkdownHeading } from 'astro';

  interface Props {
    headings: MarkdownHeading[];
  }
  ```
- **세부 동작**:
  1. 전달받은 `headings` 중 `depth === 2 || depth === 3`인 항목만 필터링한다.
  2. 필터링된 헤딩이 0개이면 목차 영역 자체를 렌더링하지 않는다.
  3. `depth === 3`인 항목은 좌측 들여쓰기(`pl-4`)를 적용하여 계층 구조를 시각적으로 구분한다.
  4. 클라이언트 스크립트(`IntersectionObserver`)를 통해 현재 뷰포트에 위치한 헤딩에 해당하는 TOC 링크에 활성 스타일(`text-blue-600 font-semibold border-l-2 border-blue-600`)을 부여한다.

---

### 3.5 `PostNavigation.astro` (`src/components/post/PostNavigation.astro`)
- **역할**: 상세 페이지 하단에서 **같은 카테고리 내** 이전 글(`prevPost`)과 다음 글(`nextPost`), 그리고 현재 카테고리 목록으로 돌아가는 버튼을 표시한다.
- **Props 인터페이스**:
  ```typescript
  import type { ProcessedPost } from '@/lib/posts';

  interface Props {
    prevPost: ProcessedPost | null;
    nextPost: ProcessedPost | null;
    categoryLabel: string;
    categoryUrl: string;
  }
  ```
- **세부 동작**:
  - 2열 그리드(`grid-cols-1 sm:grid-cols-2 gap-4`)로 좌측에 `이전 글 (Older)`, 우측에 `다음 글 (Newer)` 카드를 배치한다.
  - 이전 글이나 다음 글이 없는 경우(해당 카테고리의 첫 글 또는 마지막 글) 해당 칸은 비워두거나 `'이전/다음 게시글이 없습니다'` 비활성 박스로 표시한다.

---

### 3.6 `Pagination.astro` (`src/components/common/Pagination.astro`)
- **역할**: 카테고리 목록 및 전체 글 목록 하단에서 페이지 번호 이동 UI를 렌더링한다.
- **Props 인터페이스**:
  ```typescript
  interface Props {
    currentPage: number;
    totalPages: number;
    /** 페이지 기본 경로 (예: "/category/tech" 또는 "/posts") */
    baseUrl: string;
  }
  ```
- **세부 동작**:
  - `totalPages <= 1`이면 페이지네이션을 숨긴다.
  - 1페이지 URL은 `${withBase(baseUrl)}/`, 2페이지 이상은 `${withBase(baseUrl)}/${page}/` 형태로 생성한다.
  - 현재 페이지 번호는 파란색 배경(`bg-blue-600 text-white`)으로 강조한다.

---

### 3.7 `SearchModal.astro` (`src/components/common/SearchModal.astro`)
- **역할**: 상단 헤더의 검색 버튼 클릭(또는 `Ctrl+K` / `Cmd+K`) 시 열리는 정적 키워드 검색 모달이다.
- **세부 동작**:
  - HTML5 표준 `<dialog>` 요소를 사용하여 접근성(포커스 트랩, `ESC` 키 닫기, 배경 클릭 닫기)을 보장한다.
  - 모달이 열릴 때 `${withBase('/pagefind/pagefind-ui.js')}` 및 CSS를 로드하여 검색 입력창에 즉시 포커스를 위치시킨다.
  - 개발 서버(`npm run dev`) 환경에서 아직 `dist/pagefind`가 생성되지 않은 경우에는 안내 메시지(`"검색 인덱스는 빌드(npm run build) 후 활성화됩니다."`)를 친절히 표시한다.

---

### 3.8 `MermaidInit.astro` (`src/components/post/MermaidInit.astro`)
- **역할**: 게시글 상세 화면에 `<pre class="mermaid">` 요소가 존재할 때만 공식 `mermaid` 라이브러리를 초기화하여 다이어그램을 SVG로 렌더링한다.
- **세부 동작**:
  ```typescript
  // 클라이언트 사이드 스크립트 동작 명세
  const mermaidBlocks = document.querySelectorAll('pre.mermaid');
  if (mermaidBlocks.length > 0) {
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral', // 라이트 모드 웹진에 어울리는 깔끔한 다이어그램 테마
      securityLevel: 'loose',
      fontFamily: 'Pretendard Variable, sans-serif',
    });
    await mermaid.run({ nodes: mermaidBlocks });
  }
  ```
  - 글에 Mermaid 다이어그램이 하나도 없을 때는 `mermaid` 번들을 아예 다운로드하지 않으므로(Dynamic `import()`) 일반 게시글의 로딩 속도에 영향을 주지 않는다.

---

## 4. 마크다운 본문(`prose`) 스타일링 명세 (`src/styles/global.css`)

모든 마크다운 문법이 웹진 아티클답게 렌더링되도록 `@tailwindcss/typography` (`prose prose-zinc max-w-none`)를 기반으로 다음 커스텀 스타일 규칙을 적용한다.

1. **제목(`h1`~`h6`)**: 상단 여백을 넉넉히 확보하고 `scroll-margin-top: 5rem`(`scroll-mt-20`)을 적용하여 TOC 클릭 시 고정 헤더에 제목이 가려지지 않게 한다.
2. **표(`table`)**: 가로폭이 넓은 표가 모바일에서 레이아웃을 깨뜨리지 않도록 `overflow-x-auto` 래퍼 스타일과 헤더 배경색(`bg-zinc-100`), 얇은 테두리(`border-zinc-200`)를 적용한다.
3. **체크리스트(`input[type="checkbox"]`)**: GFM 태스크 리스트의 불릿 기호를 제거(`list-none`)하고 체크박스와 텍스트 정렬을 맞춘다.
4. **GitHub 콜아웃 블록(`.markdown-alert`)**:
   - `NOTE`: 파란색 좌측 보더(`border-l-4 border-blue-500 bg-blue-50/60`)
   - `TIP`: 초록색 좌측 보더(`border-l-4 border-emerald-500 bg-emerald-50/60`)
   - `IMPORTANT`: 보라색 좌측 보더(`border-l-4 border-violet-500 bg-violet-50/60`)
   - `WARNING`: 주황색 좌측 보더(`border-l-4 border-amber-500 bg-amber-50/60`)
   - `CAUTION`: 빨간색 좌측 보더(`border-l-4 border-rose-500 bg-rose-50/60`)
5. **Mermaid 다이어그램(`pre.mermaid`)**: 기본 코드 블록 배경을 제거하고 흰색 카드 배경 + 중앙 정렬(`flex justify-center my-6 p-4 bg-white border border-zinc-200 rounded-xl overflow-x-auto`)로 표시한다.
6. **원시 HTML 요소(`iframe`, `video`, `details`, `kbd`, `mark`)**:
   - `iframe`, `video`: `w-full aspect-video rounded-xl my-6` 반응형 비율 적용
   - `details`: 접이식 아코디언 테두리 및 패딩 스타일 적용
   - `kbd`: 키보드 단축키 모양의 입체 보더 스타일 적용
   - `mark`: 형광펜 하이라이트(`bg-amber-200/70 px-1 rounded`) 적용
