export interface CategoryMeta {
  /** 화면(상단 메뉴, 배지, 카테고리 헤더)에 표시할 이름 */
  label: string;
  /** 카테고리 목록 페이지 및 홈 섹션 상단에 표시할 짧은 소개 문구 */
  description?: string;
  /** 상단 메뉴 및 홈 화면 섹션 정렬 우선순위 (숫자가 작을수록 먼저 표시, 기본값: 999) */
  order?: number;
}

/**
 * key는 src/content/posts/<key>/ 의 폴더명과 일치해야 함.
 * 여기에 등록되지 않은 폴더가 src/content/posts/ 아래에 생성되어도
 * 자동으로 폴더명을 label로 삼아 order: 999로 정상 노출됨.
 */
export const categoryConfig: Record<string, CategoryMeta> = {
  'dev-diary': {
    label: '개발 일기',
    description: '개발과 관련된 짧은 생각, 트러블슈팅 노트, 엔지니어링 인사이트를 기록합니다.',
    order: 1,
  },
  thoughts: {
    label: '생각들',
    description: '개발과 관련 없는 일상, 독서, 문화, 습관에 대한 짧은 생각과 인사이트를 담습니다.',
    order: 2,
  },
  lectures: {
    label: '강의',
    description: '무언가를 처음부터 끝까지 직접 만들어 보는 과정을 연재하는 시리즈 아티클입니다.',
    order: 3,
  },
};
