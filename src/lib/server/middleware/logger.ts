import type { Handle } from '@sveltejs/kit/hooks';
import type { ServerErrorMiddleware } from './types';
import config from '#lib/config.server.js';
import { building } from '$app/env';

const ignorePaths = config.middleware.logger.ignorePaths;

export const handle: Handle = async ({ event, resolve }) => {
	if (building || ignorePaths.some((pattern) => event.url.pathname.match(pattern))) {
		return resolve(event);
	}
	console.log(
		`INFO: ${event.getClientAddress()} - ${event.url.pathname} [${event.request.method}]`
	);
	return resolve(event);
};

export const handleError: ServerErrorMiddleware = async (input) => {
	const { error, event } = input;
	const status = input.kind === 'unknown' ? 500 : input.error.status;
	const message = input.kind === 'unknown' ? 'Internal Error' : input.error.message;
	const address = building ? 'prerender' : event.getClientAddress();
	if (status === 404) {
		console.log(
			`INFO: ${address} tried to access ${event.url.pathname} with ${event.request.method} but failed`
		);
		return false;
	}
	if (input.kind !== 'unknown' && status < 500) {
		console.log(
			`INFO: ${status} ${message} - ${address} - ${event.url.pathname} [${event.request.method}]`
		);
		return false;
	}
	console.log(
		`ERROR: ${message} error caused by ${address} - ${event.url.pathname} [${event.request.method}]:`
	);
	console.log(error);
	return false;
};
