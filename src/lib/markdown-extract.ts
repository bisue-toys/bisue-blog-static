import { siteConfig } from '@/config/site';

/**
 * 마크다운 본문에서 코드 블록과 주석을 제거한 뒤,
 * 문서 내 가장 먼저 등장하는 마크다운 이미지(![alt](src)) 또는 HTML <img> 태그의 src를 추출한다.
 */
export function extractFirstImageFromBody(markdownBody: string | undefined): string | null {
  if (!markdownBody) return null;

  // 펜스 코드 블록 및 HTML 주석 내부의 예시 이미지는 무시
  const cleaned = markdownBody
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const mdImageRegex = /!\[[^\]]*\]\(\s*([^\s)]+)(?:\s+["'][^"']*["'])?\s*\)/;
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;

  const mdMatch = mdImageRegex.exec(cleaned);
  const htmlMatch = htmlImageRegex.exec(cleaned);

  if (mdMatch && htmlMatch) {
    return (mdMatch.index <= htmlMatch.index ? mdMatch[1] : htmlMatch[1]).trim();
  }
  if (mdMatch) {
    return mdMatch[1].trim();
  }
  if (htmlMatch) {
    return htmlMatch[1].trim();
  }

  return null;
}

/**
 * 마크다운 원본 본문에서 코드 블록, 다이어그램, HTML 태그, 마크다운 문법 기호를 모두 제거하여
 * 목록 화면 카드에 노출할 순수 평문 요약문(기본 120자)을 추출한다.
 */
export function extractExcerpt(
  markdownBody: string | undefined,
  frontmatterDescription?: string,
  maxLength: number = siteConfig.excerptLength
): string {
  if (frontmatterDescription && frontmatterDescription.trim().length > 0) {
    const desc = frontmatterDescription.trim();
    return desc.length > maxLength ? `${desc.slice(0, maxLength).trimEnd()}...` : desc;
  }

  if (!markdownBody) return '';

  const plain = markdownBody
    // 1. 펜스 코드 블록 제거 (```...``` 및 ~~~...~~~)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    // 2. GitHub 콜아웃 헤더([!NOTE] 등) 제거
    .replace(/^\s*>\s*\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/gim, ' ')
    // 3. HTML 주석 및 모든 원시 HTML 태그 제거
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    // 4. 마크다운 이미지 제거
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    // 5. 마크다운 링크는 텍스트만 보존
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // 6. 각주 정의 및 참조 기호 제거
    .replace(/^\[\^[^\]]+\]:.*$/gm, ' ')
    .replace(/\[\^[^\]]+\]/g, '')
    // 7. 인라인 코드 백틱 제거
    .replace(/`([^`]+)`/g, '$1')
    // 8. 마크다운 제목(#), 인용(>), 수평선(---, ***), 체크박스([ ], [x]), 표 구분선(|) 제거
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*(?:[-*_]\s*){3,}$/gm, ' ')
    .replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\|/g, ' ')
    // 9. 볼드, 이탤릭, 취소선 기호 제거
    .replace(/(\*\*|__|~~|\*|_)/g, '')
    // 10. 연속 공백 및 줄바꿈을 단일 공백으로 압축
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= maxLength) {
    return plain;
  }

  return `${plain.slice(0, maxLength).trimEnd()}...`;
}
