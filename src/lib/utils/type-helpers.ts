export type Override<T, U> = U & Omit<T, keyof U>;

export type Flatten<T> = {
	[K in keyof T]: T[K];
} & {};
