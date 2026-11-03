/**
 * 내부 경로에 GitHub Pages base 경로(import.meta.env.BASE_URL)를 안전하게 결합한다.
 * - 외부 URL(http://, https://, mailto:, tel:, #, data:)은 변환하지 않고 그대로 반환한다.
 * - 이미 base 경로로 시작하는 경우 중복 부착하지 않는다.
 */
export function withBase(path: string): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  if (!path || path === '/') {
    return `${base}/`;
  }
  if (/^(https?:\/\/|mailto:|tel:|#|data:)/i.test(path)) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (base && (cleanPath === base || cleanPath.startsWith(`${base}/`))) {
    return cleanPath;
  }

  return `${base}${cleanPath}`;
}

/**
 * 현재 URL 경로와 대상 경로가 일치하거나 하위 경로인지 판별한다.
 */
export function isActivePath(currentPath: string, targetPath: string): boolean {
  const normCurrent = currentPath.replace(/\/$/, '') || '/';
  const normTarget = withBase(targetPath).replace(/\/$/, '') || '/';
  return normCurrent === normTarget;
}
