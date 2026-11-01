import type { HandleServerError } from '@sveltejs/kit/hooks';

export type ServerErrorMiddleware = (...args: Parameters<HandleServerError>) => Promise<boolean>;
