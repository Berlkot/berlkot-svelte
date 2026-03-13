import config from '$lib/config.server';
import type { Handle } from '@sveltejs/kit';
import type { ServerErrorMiddleware } from './types';

const protectedRoutePatterns = config.middleware.protector.protectedRoutePatterns;

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/__access_denied__') {
		event.locals.violated_protected_route_access = event.request.headers.get('x-violated-path');
		return resolve(event);
	}

	if (!protectedRoutePatterns.some((pattern) => event.url.pathname.match(pattern))) {
		return resolve(event);
	}
	// Since error() is not intended to be used in handle function,
	// we use fetch on nonexistent page to redirect to the proper error page.
	// ugh what the FUCK!
	const internalUrl = new URL(event.url);
	internalUrl.pathname = '/__access_denied__';
	// hack to not cause ConnectionRefused
	internalUrl.protocol = 'http:';

	const response = await event.fetch(internalUrl.href, {
		headers: {
			'x-violated-path': event.url.pathname,
			...Object.fromEntries(event.request.headers)
		}
	});

	return new Response(response.body, {
		status: 404,
		headers: response.headers
	});
};

export const handleError: ServerErrorMiddleware = async ({ error, event, status, message }) => {
	if (event.locals.violated_protected_route_access && status !== 500) {
		console.log(
			`INFO: ${event.getClientAddress()} tried to access ${event.locals.violated_protected_route_access} protected route without login`
		);
		return true;
	}
	return false;
};
