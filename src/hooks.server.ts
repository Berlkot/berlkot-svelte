import { ADMIN_SECRET } from '$env/static/private';

export async function handle({ event, resolve }) {
	if (event.url.pathname === '/__access_denied__') {
		event.locals.violated_protected_route_access = event.request.headers.get('x-violated-path');
		return resolve(event);
	}
	if (event.cookies.get('auth') === ADMIN_SECRET) {
		event.locals.admin = true;
	} else if (event.url.pathname.startsWith('/admin')) {
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
	}
	console.log(
		`INFO: ${event.getClientAddress()} - ${event.url.pathname} [${event.request.method}]`
	);
	return resolve(event);
}

export async function handleError({ error, event, status, message }) {
	if (event.locals.violated_protected_route_access) {
		console.log(
			`INFO: ${event.getClientAddress()} tried to access ${event.locals.violated_protected_route_access} protected route without login`
		);
		return;
	}
	if (status === 404) {
		console.log(
			`INFO: ${event.getClientAddress()} tried to access ${event.url.pathname} with ${event.request.method} but failed`
		);
		return;
	}
	console.log(
		`ERROR: ${message} error caused by ${event.getClientAddress()} - ${event.url.pathname} [${event.request.method}]:`
	);
	console.log(error);
}
