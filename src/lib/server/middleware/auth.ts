import type { Handle } from '@sveltejs/kit';
import { ADMIN_SECRET } from '$env/static/private';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.cookies.get('auth') === ADMIN_SECRET) {
		event.locals.admin = true;
	}
	return resolve(event);
};
