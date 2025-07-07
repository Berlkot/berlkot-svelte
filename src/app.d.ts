// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			admin: boolean;
		}
		// interface PageData {}
		interface PageState {
      selected: {
        meta: {[name: string]: string}
        galleryPost: object
      };
		}
		// interface Platform {}
	}
}

export {};
