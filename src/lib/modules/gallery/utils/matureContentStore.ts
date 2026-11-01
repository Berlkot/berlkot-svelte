import { browser } from '$app/env';
import { writable } from 'svelte/store';

export const confirmedMatureContent = writable(
	browser && localStorage.getItem('confirmedMatureContent') === 'true'
);
