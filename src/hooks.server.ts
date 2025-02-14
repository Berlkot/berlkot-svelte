import { ADMIN_SECRET } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
	console.log(
		`INFO: ${event.getClientAddress()} - ${event.url.pathname} [${event.request.method}]`
	);
	if (event.cookies.get('auth') === ADMIN_SECRET) {
		event.locals.admin = true;
	} else if (event.url.pathname.startsWith('/admin')) {
		// this is deranged that i have to use fucking redirect here and cannot throw 404
		// sveltekit is a such great framework omg
		redirect(307, '/login');
	}
	return resolve(event);
}

export async function handleError({ error, event, status, message }) {
	if (status === 404) {
		console.log(
			`INFO: ${event.getClientAddress()} tried to access ${event.url.pathname} with ${event.request.method} but failed`
		);
		return
	}
	console.log(
		`ERROR: ${message} error caused by ${event.getClientAddress()} - ${event.url.pathname} [${event.request.method}]:`
	);
	console.log(error);
}
