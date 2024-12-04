import { ADMIN_SECRET } from '$env/static/private';
import { error } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
	if (event.cookies.get('auth') === ADMIN_SECRET) {
		event.locals.admin = true;
	} else if (event.url.pathname.startsWith('/admin')) {
		throw error(404, 'Not found');
	}
	return await resolve(event);
}
