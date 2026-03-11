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
			method: 'GET',
			headers: {
				'x-violated-path': event.url.pathname,
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
