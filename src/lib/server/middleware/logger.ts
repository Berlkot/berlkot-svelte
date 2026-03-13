import type { Handle } from '@sveltejs/kit';
import type { ServerErrorMiddleware } from './types';
import config from '$lib/config.server';

const ignorePaths = config.middleware.logger.ignorePaths;

export const handle: Handle = async ({ event, resolve }) => {
	if (ignorePaths.some((pattern) => event.url.pathname.match(pattern))) {
		return resolve(event);
	}
	console.log(
		`INFO: ${event.getClientAddress()} - ${event.url.pathname} [${event.request.method}]`
	);
	return resolve(event);
};

export const handleError: ServerErrorMiddleware = async ({ error, event, status, message }) => {
	if (status === 404) {
		console.log(
			`INFO: ${event.getClientAddress()} tried to access ${event.url.pathname} with ${event.request.method} but failed`
		);
		return false;
	}
	console.log(
		`ERROR: ${message} error caused by ${event.getClientAddress()} - ${event.url.pathname} [${event.request.method}]:`
	);
	console.log(error);
	return false;
};
