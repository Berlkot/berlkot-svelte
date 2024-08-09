import { ADMIN_SECRET } from "$env/static/private";

export async function handle({ event, resolve }) {
	if (event.cookies.get("auth") === ADMIN_SECRET) {
	  event.locals.admin = true
	}
	return await resolve(event);
}