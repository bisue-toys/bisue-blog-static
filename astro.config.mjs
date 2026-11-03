import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import expressiveCode from 'astro-expressive-code';
import remarkGfm from 'remark-gfm';
import { remarkAlert } from 'remark-github-blockquote-alert';
import rehypeRaw from 'rehype-raw';
import { visit } from 'unist-util-visit';

const siteUrl = process.env.SITE_URL || 'https://bisue.github.io';
const basePath = process.env.SITE_BASE || '/bisue-blog-static';

/**
 * HTML 특수문자를 이스케이프하여 Mermaid 화살표(-->, <-->)나 제네릭(<T>)이
 * rehype-raw에서 깨지지 않고 텍스트 노드로 보존되도록 처리한다.
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Remark 플러그인: ```mermaid 코드 블록을 <pre class="mermaid"> HTML 노드로 변환한다.
 * (rehype-expressive-code가 일반 코드 블록으로 하이라이팅하는 것을 방지하고,
 * 클라이언트에서 공식 mermaid 패키지가 SVG로 렌더링하도록 전달)
 */
function remarkMermaidPre() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (node.lang && node.lang.toLowerCase() === 'mermaid') {
        parent.children[index] = {
          type: 'html',
          value: `<div class="mermaid-container"><pre class="mermaid">${escapeHtml(node.value)}</pre></div>`,
        };
      }
    });
  };
}

/**
 * Rehype 플러그인:
 * 1. 마크다운 내부의 루트 상대 경로(/images/...) 이미지 및 링크에 GitHub Pages basePath를 자동 부착한다.
 * 2. 마크다운 표(<table>)를 반응형 스크롤 컨테이너(<div tabindex="0" role="region">)로 감싼다.
 */
function rehypeWebzineEnhancer() {
  const normalizedBase = basePath.replace(/\/$/, '');

  function prefixBase(url) {
    if (!url || typeof url !== 'string') return url;
    if (/^(https?:\/\/|mailto:|tel:|#|data:)/i.test(url)) return url;
    if (!url.startsWith('/')) return url;
    if (normalizedBase && (url === normalizedBase || url.startsWith(`${normalizedBase}/`))) {
      return url;
    }
    return `${normalizedBase}${url}`;
  }

  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'img' && node.properties?.src) {
        node.properties.src = prefixBase(String(node.properties.src));
        if (!node.properties.loading) {
          node.properties.loading = 'lazy';
        }
      }

      if (node.tagName === 'a' && node.properties?.href) {
        node.properties.href = prefixBase(String(node.properties.href));
      }

      if (
        node.tagName === 'table' &&
        parent &&
        typeof index === 'number' &&
        parent.tagName !== 'div'
      ) {
        parent.children[index] = {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['table-wrapper'],
            tabIndex: 0,
            role: 'region',
            'aria-label': '표 데이터 영역',
          },
          children: [node],
        };
      }
    });
  };
}

export default defineConfig({
  site: siteUrl,
  base: basePath,
  trailingSlash: 'ignore',
  integrations: [
    expressiveCode({
      themes: ['github-dark', 'github-light'],
      defaultProps: {
        wrap: true,
      },
      styleOverrides: {
        borderRadius: '0.75rem',
        codeFontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        uiFontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      },
    }),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  markdown: {
    remarkPlugins: [remarkGfm, remarkAlert, remarkMermaidPre],
    rehypePlugins: [rehypeRaw, rehypeWebzineEnhancer],
  },
});
