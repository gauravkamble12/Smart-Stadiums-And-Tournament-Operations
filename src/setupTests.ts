import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill fetch for tests with a default valid mock to prevent TypeError on .ok
global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({})
});
