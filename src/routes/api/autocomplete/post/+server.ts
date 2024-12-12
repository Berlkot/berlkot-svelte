import prisma from '$lib/server/prisma.js';
import { json } from '@sveltejs/kit';


export async function POST({ request }) {
	const { text } = await request.json();
	
    const tags = await prisma.postTag.findMany({
        where: {
            name: {
                contains: text
            }
        }
    })
    return json(tags);
}