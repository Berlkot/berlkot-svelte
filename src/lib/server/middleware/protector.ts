import type { Handle } from '@sveltejs/kit/hooks';
import config from '#lib/config.server.js';
import { getAuthContext } from '../context/auth';

const protectedRoutePatterns = config.middleware.protector.protectedRoutePatterns;

export const handle: Handle = async ({ event, resolve }) => {
	if (
		getAuthContext()?.isAdmin ||
		!protectedRoutePatterns.some((pattern) => event.url.pathname.match(pattern))
	) {
		return resolve(event);
	}
	console.log(
		`INFO: ${event.getClientAddress()} tried to access ${event.url.pathname} protected route without login`
	);
	/* HACK: Since error() is not intended to be used in handle function,
	         we use fetch on nonexistent page to redirect to the proper error page.
					 ugh what the FUCK! */
	const internalUrl = new URL(event.url);
	internalUrl.pathname = '/__access_denied__';

	// HACK: to not cause ConnectionRefused
	internalUrl.protocol = 'http:';

	const response = await event.fetch(internalUrl.href, {
		method: 'GET',
		headers: {
			Accept: event.request.headers.get('Accept') || 'text/html'
		}
	});

	const htmlBody = await response.text();

	return new Response(htmlBody, {
		status: 404,
		headers: {
			'Content-Type': response.headers.get('Content-Type') || 'text/html'
		}
	});
};
