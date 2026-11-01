import { sequence } from '@sveltejs/kit/hooks';
import type { HandleServerError } from '@sveltejs/kit/hooks';
import { handleOrder, handleErrorOrder } from '#lib/server/middleware/index.js';

export const handle = sequence(...handleOrder);

export const handleError: HandleServerError = async (input) => {
	for (const handler of handleErrorOrder) {
		if (await handler(input)) {
			return;
		}
	}
};
