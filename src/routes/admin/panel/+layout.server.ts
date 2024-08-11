import { error, type RequestEvent } from "@sveltejs/kit";

export async function load({locals}: RequestEvent) {
  if (!locals.admin) {
    return error(404)
  }
}