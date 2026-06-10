import type { Handle } from '@sveltejs/kit';
import { localeContext } from '../context/locale';

export const DEFAULT_LOCALE = 'en-US';
// https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites#locale-specific-urls
// if google doesnt recommend url params as language tool, why docs site uses them?
// TODO: localization architecture needs more thinking
// kinda a bid deal, because most russian audience will use translator anyway
// so why not make their life a little easier?
// however this change is not as strait forward as it seems (more as a warning)
export const handle: Handle = async ({ event, resolve }) => {
	const userLocale =
		event.url.searchParams.get('lang') ||
		event.request.headers.get('accept-language') ||
		DEFAULT_LOCALE;
	return localeContext.run({ locale: userLocale }, () => {
		return resolve(event);
	});
};
