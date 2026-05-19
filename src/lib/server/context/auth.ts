import { AsyncLocalStorage } from 'node:async_hooks';
export interface AuthContext {
	isAdmin: boolean;
}

export const authContext = new AsyncLocalStorage<AuthContext>();

/**
 * Check if user has rights
 * @returns AuthContext (currently Object with boolean check if admin or not)
 */
export function getAuthContext(): AuthContext {
	const context = authContext.getStore();
	if (!context) throw new Error('Auth context was called outside of a request context. Ouch!');
	return context;
}
/**
 * Utility to automatically assign Visibility depending on the role
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assignPermissionQuery(q: any) {
	const { isAdmin } = getAuthContext();
	if (isAdmin) return q;
	if (!('where' in q)) {
		q.where = {};
	}
	q.where.visibility = 'PUBLIC';
	return q;
}
