import { ADMIN_SECRET } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
	if (event.cookies.get('auth') === ADMIN_SECRET) {
		event.locals.admin = true;
	} else if (event.url.pathname.startsWith('/admin')) {
		// this is deranged that i have to use fucking redirect here and cannot throw 404 
		// sveltekit is a such great framework omg
		redirect(307, '/login');
	}
	return resolve(event);
}
