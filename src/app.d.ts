// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// TODO: Look into better state managment
		interface PageState {
			selected: {
				meta: { [name: string]: string };
				galleryPost: object;
			};
		}
		// interface Platform {}
	}
}

export {};
