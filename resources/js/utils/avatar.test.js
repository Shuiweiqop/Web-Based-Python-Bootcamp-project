import { describe, expect, it } from 'vitest';
import { avatarUrl } from './avatar';

describe('avatarUrl', () => {
    it('returns an inline SVG data URI (no external request)', () => {
        const url = avatarUrl('Ada Lovelace');
        expect(url.startsWith('data:image/svg+xml,')).toBe(true);
        expect(url).not.toContain('dicebear');
        // No external avatar host (the only http here is the static SVG xmlns).
        expect(url).not.toMatch(/https?:\/\/api\./);
    });

    it('is deterministic for the same name', () => {
        expect(avatarUrl('Grace Hopper')).toBe(avatarUrl('Grace Hopper'));
    });

    it('encodes initials from the name', () => {
        const decoded = decodeURIComponent(avatarUrl('Ada Lovelace'));
        expect(decoded).toContain('>AL<');
    });

    it('uses the first two letters for a single-word name', () => {
        const decoded = decodeURIComponent(avatarUrl('Linus'));
        expect(decoded).toContain('>LI<');
    });

    it('falls back to "?" for empty or null names', () => {
        expect(decodeURIComponent(avatarUrl(null))).toContain('>?<');
        expect(decodeURIComponent(avatarUrl(''))).toContain('>?<');
    });
});
