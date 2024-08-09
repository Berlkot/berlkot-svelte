import { ADMIN_SECRET } from "$env/static/private"
// pls change befor deploying to prod bruh
export async function GET({ cookies, setHeaders }) {
  const date = new Date()
  date.setDate(date.getDate() + 20)
  cookies.set("auth", ADMIN_SECRET, { path: "/", httpOnly: true, secure: true, sameSite: true , expires: date })
  const response = new Response("success", {status: 200})
 	setHeaders({
		'Content-Type': 'text/plain'
	});
  return response
}