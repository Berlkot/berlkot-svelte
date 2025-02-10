import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export const confirmedMatureContent = writable(
	browser && localStorage.getItem('confirmedMatureContent') === 'true'
);
