import { sequence } from '@sveltejs/kit/hooks';
import { handleOrder, handleErrorOrder } from '#lib/server/middleware/index.js';

export const handle = sequence(...handleOrder);

export async function handleError({ error, event, status, message }) {
	for (const handler of handleErrorOrder) {
		if (await handler({ error, event, status, message })) {
			return;
		}
	}
}
