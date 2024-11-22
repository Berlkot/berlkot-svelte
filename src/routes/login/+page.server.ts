import { ADMIN_SECRET } from '$env/static/private';
import { fail, redirect, type RequestEvent } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, cookies }: RequestEvent) => {
		const data = await request.formData();
		const token = data.get('token');
		if (token && token === ADMIN_SECRET) {
			const date = new Date();
			date.setDate(date.getDate() + 20);
			cookies.set('auth', ADMIN_SECRET, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: true,
				expires: date
			});
			redirect(303, '/');
		} else {
			return fail(400, { invalid: true });
		}
	}
};
