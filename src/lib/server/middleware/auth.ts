import type { Handle } from '@sveltejs/kit';
import { ADMIN_SECRET } from '$env/static/private';
import { authContext } from '$lib/server/context/auth';

export const handle: Handle = async ({ event, resolve }) => {
	let isAdmin = false;
	if (event.cookies.get('auth') === ADMIN_SECRET) {
		isAdmin = true;
	}
	return authContext.run({ isAdmin: isAdmin }, () => {
		return resolve(event);
	});
};
