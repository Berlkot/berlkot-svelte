import type { HandleServerError } from '@sveltejs/kit';

export type ServerErrorMiddleware = (...args: Parameters<HandleServerError>) => Promise<boolean>;
