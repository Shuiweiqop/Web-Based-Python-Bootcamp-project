// Local, offline, privacy-safe avatar generator.
//
// Replaces the previous external api.dicebear.com calls, which leaked every
// user's name to a third party on each render and broke when offline / in CI.
// Produces a deterministic initials avatar as an inline SVG data URI, so it
// never makes a network request and always renders.

const PALETTE = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
    '#10B981', '#EF4444', '#06B6D4', '#6366F1',
];

function hashString(value) {
    let hash = 0;
    const str = String(value);
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function initials(name) {
    const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Deterministic initials avatar as an inline SVG data URI.
 * @param {string} name - display name (or any seed) to derive initials + colour
 * @returns {string} a `data:image/svg+xml,...` URI usable as an <img> src
 */
export function avatarUrl(name) {
    const seed = name || 'default';
    const label = initials(name);
    const bg = PALETTE[hashString(seed) % PALETTE.length];

    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">` +
        `<rect width="100" height="100" rx="50" fill="${bg}"/>` +
        `<text x="50" y="50" dy="0.35em" text-anchor="middle" ` +
        `font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="600" fill="#ffffff">${label}</text>` +
        `</svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export default avatarUrl;
