/**
 * One codebase, two invitations:
 *   /    → Hà Nội (default)
 *   /na  → Nghệ An (different date, time and venue; its own Neon database)
 */
export type SiteId = 'hn' | 'na';

const detectSite = (): SiteId => {
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return path === '/na' || path.startsWith('/na/') ? 'na' : 'hn';
};

export const siteId: SiteId = detectSite();

/** Appends `?site=na` so the API reads/writes the Nghệ An database. */
export const apiUrl = (path: string) => (siteId === 'na' ? `${path}${path.includes('?') ? '&' : '?'}site=na` : path);

/** Keeps per-site browser state (saved RSVP etc.) from leaking between invitations. */
export const siteStorageKey = (key: string) => (siteId === 'na' ? `${key}-na` : key);

/** Fields that differ from the Hà Nội content in wedding-content.json. */
export const siteOverrides: Record<SiteId, Partial<{
  weddingDate: string;
  weddingTime: string;
  locationName: string;
  locationAddress: string;
  googleMapsUrl: string;
}>> = {
  hn: {},
  na: {
    weddingDate: '2026-11-29',
    weddingTime: '11:00',
    locationName: 'UBND Xã Hưng Chính (cũ)',
    locationAddress: 'Khối 1, Phường Thành Vinh, Tỉnh Nghệ An',
    googleMapsUrl: 'https://maps.app.goo.gl/cdyDp5BrGJfeeeoBA',
  },
};
