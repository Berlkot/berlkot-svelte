import type { Handle } from '@sveltejs/kit/hooks';
import { ADMIN_SECRET } from '$app/env/private';
import { authContext } from '#lib/server/context/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
	let isAdmin = false;
	if (event.cookies.get('auth') === ADMIN_SECRET) {
		isAdmin = true;
	}
	return authContext.run({ isAdmin }, () => {
		return resolve(event);
	});
};
