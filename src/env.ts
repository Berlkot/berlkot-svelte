import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	ADMIN_SECRET: { static: true },
	DATABASE_URL: { static: true }
});
