import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    /** [필수] 게시글 제목 */
    title: z.string().min(1, '제목을 입력해 주세요.'),

    /** [필수] 작성일 (YYYY-MM-DD 또는 ISO 날짜 형식) */
    pubDate: z.coerce.date(),

    /** [선택] 최종 수정일 */
    updatedDate: z.coerce.date().optional(),

    /**
     * [선택] 목록 화면 미리보기 요약문.
     * 미입력 시 본문 마크다운에서 평문 120자를 자동 추출함.
     */
    description: z.string().optional(),

    /**
     * [선택] 대표 썸네일 이미지 경로.
     * - 상대 경로('./cover.png'), public 경로('/images/...'), 외부 URL('https://...') 모두 지원.
     * - 미입력 시 본문 내 첫 번째 이미지를 자동 추출하며, 본문에도 없으면 기본 플레이스홀더 사용.
     */
    thumbnail: z.string().optional(),

    /** [선택] 썸네일 이미지 대체 텍스트 (접근성용, 기본값은 게시글 title) */
    thumbnailAlt: z.string().optional(),

    /** [선택] 초안 여부 (true일 경우 프로덕션 빌드에서 제외, 기본값: false) */
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  posts: postsCollection,
};
