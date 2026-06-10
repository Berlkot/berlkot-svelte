import { AsyncLocalStorage } from 'node:async_hooks';
export interface LocaleContext {
	locale: string;
}

export const localeContext = new AsyncLocalStorage<LocaleContext>();

/**
 * Check what lang user eexpects content
 * @returns LocaleContext
 */
export function getLocaleContext(): LocaleContext {
	const context = localeContext.getStore();
	if (!context) throw new Error('Locale context was called outside of a request context. Ouch!');
	return context;
}
/**
 * Utility to get lang without interacting with context
 */
export function getUserLocale() {
	return getLocaleContext().locale;
}
