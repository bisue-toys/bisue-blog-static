export interface SiteConfig {
  /** 사이트 메인 타이틀 (상단 로고 및 브라우저 타이틀에 표시) */
  title: string;
  /** 사이트 부제 / 한 줄 소개 */
  subtitle: string;
  /** SEO 메타 description 기본값 */
  description: string;
  /** 작성자 또는 웹진 발행처 이름 */
  author: string;
  /** 배포 도메인 주소 (예: "https://<username>.github.io") */
  siteUrl: string;
  /** GitHub Pages 서브 경로 (예: "/bisue-blog-static", 루트 도메인 배포 시 "/") */
  basePath: string;
  /** 언어 코드 */
  locale: 'ko-KR';
  /** 홈 화면에서 각 카테고리 섹션당 보여줄 최신 게시글 개수 (기본값: 3) */
  homePostsPerCategory: number;
  /** 목록 화면(카테고리별 / 전체 글)에서 한 페이지당 보여줄 게시글 개수 (기본값: 9) */
  postsPerPage: number;
  /** 본문 미리보기(Excerpt) 자동 추출 시 최대 글자 수 (기본값: 120) */
  excerptLength: number;
  /** 기본 플레이스홀더 썸네일 경로 (public 폴더 기준) */
  defaultThumbnail: string;
}

export const siteConfig: SiteConfig = {
  title: 'BISUE WEBZINE',
  subtitle: '생각과 기술, 문화를 큐레이션하는 디지털 웹진',
  description: '마크다운 기반의 모던 에디토리얼 정적 웹진 블로그입니다.',
  author: 'Bisue',
  siteUrl: process.env.SITE_URL || 'https://bisue.github.io',
  basePath: process.env.SITE_BASE || '/bisue-blog-static',
  locale: 'ko-KR',
  homePostsPerCategory: 3,
  postsPerPage: 9,
  excerptLength: 120,
  defaultThumbnail: '/images/default-thumbnail.svg',
};
