import type { ImageMetadata } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { categoryConfig } from '@/config/categories';
import { siteConfig } from '@/config/site';
import { extractExcerpt, extractFirstImageFromBody } from '@/lib/markdown-extract';
import { withBase } from '@/lib/url';

export interface ResolvedCategory {
  /** 폴더명 기반 슬러그 (예: "tech") */
  slug: string;
  /** 화면 표시 이름 (예: "테크 & 개발") */
  label: string;
  /** 카테고리 설명 */
  description: string;
  /** 정렬 순서 */
  order: number;
  /** 해당 카테고리에 속한 게시글 총 개수 */
  count: number;
  /** 카테고리 목록 페이지 URL (Base Path 적용됨) */
  url: string;
}

export interface ResolvedThumbnail {
  /** 최종 결정된 이미지 소스 구분 */
  type: 'astro-asset' | 'url';
  /** type === 'astro-asset' 일 때 Astro ImageMetadata 객체 */
  asset?: ImageMetadata;
  /** 최종 이미지 URL 문자열 (Base Path 적용 완료) */
  src: string;
  /** 이미지 alt 텍스트 */
  alt: string;
  /** 플레이스홀더 여부 */
  isFallback: boolean;
}

export interface ProcessedPost {
  /** 원본 Astro 컬렉션 엔트리 (render() 호출용) */
  entry: CollectionEntry<'posts'>;
  /** 고유 ID (예: "tech/markdown-features") */
  id: string;
  /** 파일명 기반 게시글 슬러그 (예: "markdown-features") */
  slug: string;
  /** 소속 카테고리 슬러그 (예: "tech") */
  categorySlug: string;
  /** 소속 카테고리 표시 이름 (예: "테크 & 개발") */
  categoryLabel: string;
  /** 게시글 제목 */
  title: string;
  /** 작성일 Date 객체 */
  pubDate: Date;
  /** 수정일 Date 객체 (있을 경우) */
  updatedDate?: Date;
  /** 포맷팅된 작성일 문자열 (예: "2026. 11. 03.") */
  formattedDate: string;
  /** 최종 결정된 120자 본문 미리보기 텍스트 */
  excerpt: string;
  /** 최종 결정된 썸네일 정보 (Frontmatter -> 본문 첫 이미지 -> 기본 플레이스홀더) */
  thumbnail: ResolvedThumbnail;
  /** 상세 페이지 최종 URL (예: "/bisue-blog-static/posts/tech/markdown-features/") */
  url: string;
  /** 카테고리 목록 페이지 URL (예: "/bisue-blog-static/category/tech/") */
  categoryUrl: string;
}

// src/content/posts 내부에 마크다운과 함께 배치된 로컬 이미지 에셋 맵
const localPostImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/posts/**/*.{png,jpg,jpeg,gif,webp,avif,svg}',
  { eager: true }
);

/**
 * 날짜 객체를 웹진 스타일('YYYY. MM. DD.')로 포맷팅한다.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}. ${month}. ${day}.`;
}

/**
 * 카테고리 슬러그(폴더명)를 기반으로 표시 이름, 설명, 정렬 순서를 반환한다.
 * categories.ts에 등록되지 않은 폴더명도 에러 없이 폴더명을 그대로 표시명으로 사용한다.
 */
export function getCategoryMeta(categorySlug: string): {
  label: string;
  description: string;
  order: number;
} {
  const configured = categoryConfig[categorySlug];
  if (configured) {
    return {
      label: configured.label,
      description: configured.description ?? `${configured.label} 카테고리의 아티클 모음입니다.`,
      order: configured.order ?? 999,
    };
  }

  return {
    label: categorySlug,
    description: `${categorySlug} 카테고리의 아티클 모음입니다.`,
    order: 999,
  };
}

/**
 * 컬렉션 엔트리 ID 또는 파일 경로에서 카테고리 슬러그(1단계 폴더명)와 파일 슬러그를 분리한다.
 */
function parseCategoryAndSlug(entry: CollectionEntry<'posts'>): {
  categorySlug: string;
  slug: string;
} {
  const raw = (entry.filePath ? entry.filePath.replace(/^.*src\/content\/posts\//i, '') : entry.id)
    .replace(/\\/g, '/')
    .replace(/\.md$/i, '');

  const segments = raw.split('/').filter(Boolean);
  if (segments.length >= 2) {
    return {
      categorySlug: segments[0],
      slug: segments.slice(1).join('-'),
    };
  }

  return {
    categorySlug: 'uncategorized',
    slug: segments[0] || 'post',
  };
}

/**
 * 상대 경로('./cover.png'), public 경로('/images/...'), 외부 URL('https://...')을 모두 해석하여
 * ResolvedThumbnail 객체를 반환한다.
 */
function resolveImageSource(
  rawSrc: string | undefined,
  categorySlug: string,
  altText: string
): ResolvedThumbnail | null {
  if (!rawSrc || !rawSrc.trim()) return null;
  const src = rawSrc.trim();

  // 1. 외부 URL인 경우
  if (/^https?:\/\//i.test(src)) {
    return {
      type: 'url',
      src,
      alt: altText,
      isFallback: false,
    };
  }

  // 2. public 폴더 기준 절대 경로('/images/...')인 경우
  if (src.startsWith('/')) {
    return {
      type: 'url',
      src: withBase(src),
      alt: altText,
      isFallback: false,
    };
  }

  // 3. 마크다운과 같은 폴더 기준 상대 경로('./img.png' 또는 'img.png')인 경우
  const normalizedRel = src.replace(/^\.\//, '');
  const candidateKey = `/src/content/posts/${categorySlug}/${normalizedRel}`;
  const matchedAsset = localPostImages[candidateKey];

  if (matchedAsset?.default) {
    return {
      type: 'astro-asset',
      asset: matchedAsset.default,
      src: matchedAsset.default.src,
      alt: altText,
      isFallback: false,
    };
  }

  return null;
}

/**
 * 썸네일 3단계 Fallback 결정:
 * 1순위: Frontmatter thumbnail 지정
 * 2순위: 마크다운 본문 첫 번째 이미지 자동 추출
 * 3순위: 기본 플레이스홀더 이미지 (/images/default-thumbnail.svg)
 */
function resolveThumbnail(
  entry: CollectionEntry<'posts'>,
  categorySlug: string
): ResolvedThumbnail {
  const alt = entry.data.thumbnailAlt || entry.data.title;

  // 1순위: Frontmatter thumbnail
  const fromFrontmatter = resolveImageSource(entry.data.thumbnail, categorySlug, alt);
  if (fromFrontmatter) {
    return fromFrontmatter;
  }

  // 2순위: 본문 첫 번째 이미지 자동 추출
  const firstBodyImg = extractFirstImageFromBody(entry.body);
  const fromBody = resolveImageSource(firstBodyImg ?? undefined, categorySlug, alt);
  if (fromBody) {
    return fromBody;
  }

  // 3순위: 기본 플레이스홀더
  return {
    type: 'url',
    src: withBase(siteConfig.defaultThumbnail),
    alt,
    isFallback: true,
  };
}

/**
 * 전체 게시글을 로드하여 가공된 ProcessedPost 배열(최신순 정렬)로 반환한다.
 */
export async function getAllPosts(): Promise<ProcessedPost[]> {
  const rawEntries = await getCollection('posts', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  const processed: ProcessedPost[] = rawEntries.map((entry) => {
    const { categorySlug, slug } = parseCategoryAndSlug(entry);
    const categoryMeta = getCategoryMeta(categorySlug);
    const thumbnail = resolveThumbnail(entry, categorySlug);
    const excerpt = extractExcerpt(entry.body, entry.data.description, siteConfig.excerptLength);

    return {
      entry,
      id: `${categorySlug}/${slug}`,
      slug,
      categorySlug,
      categoryLabel: categoryMeta.label,
      title: entry.data.title,
      pubDate: entry.data.pubDate,
      updatedDate: entry.data.updatedDate,
      formattedDate: formatDate(entry.data.pubDate),
      excerpt,
      thumbnail,
      url: withBase(`/posts/${categorySlug}/${slug}/`),
      categoryUrl: withBase(`/category/${categorySlug}/`),
    };
  });

  // 작성일 최신순 정렬 (날짜가 동일하면 슬러그 사전순 정렬)
  return processed.sort((a, b) => {
    const timeDiff = b.pubDate.getTime() - a.pubDate.getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.slug.localeCompare(b.slug, 'ko');
  });
}

/**
 * 게시글이 존재하는 모든 카테고리 목록과 각 카테고리의 게시글 수를 정렬하여 반환한다.
 */
export async function getCategoriesWithCount(): Promise<ResolvedCategory[]> {
  const allPosts = await getAllPosts();
  const countMap = new Map<string, number>();

  for (const post of allPosts) {
    countMap.set(post.categorySlug, (countMap.get(post.categorySlug) ?? 0) + 1);
  }

  const categories: ResolvedCategory[] = Array.from(countMap.entries()).map(([slug, count]) => {
    const meta = getCategoryMeta(slug);
    return {
      slug,
      label: meta.label,
      description: meta.description,
      order: meta.order,
      count,
      url: withBase(`/category/${slug}/`),
    };
  });

  return categories.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.label.localeCompare(b.label, 'ko');
  });
}

/**
 * 특정 카테고리에 속한 게시글 목록을 최신순으로 반환한다.
 */
export async function getPostsByCategory(categorySlug: string): Promise<ProcessedPost[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.categorySlug === categorySlug);
}

/**
 * 상세 화면 하단용: 같은 카테고리 내에서 현재 글의 이전 글(Older)과 다음 글(Newer)을 반환한다.
 */
export async function getAdjacentPostsInCategory(
  categorySlug: string,
  currentSlug: string
): Promise<{ prevPost: ProcessedPost | null; nextPost: ProcessedPost | null }> {
  const categoryPosts = await getPostsByCategory(categorySlug);
  const currentIndex = categoryPosts.findIndex((p) => p.slug === currentSlug);

  if (currentIndex === -1) {
    return { prevPost: null, nextPost: null };
  }

  // categoryPosts는 최신순(내림차순)이므로:
  // index - 1 이 더 최근에 작성된 '다음 글(nextPost)'
  // index + 1 이 더 이전에 작성된 '이전 글(prevPost)'
  const nextPost = currentIndex > 0 ? categoryPosts[currentIndex - 1] : null;
  const prevPost =
    currentIndex < categoryPosts.length - 1 ? categoryPosts[currentIndex + 1] : null;

  return { prevPost, nextPost };
}
