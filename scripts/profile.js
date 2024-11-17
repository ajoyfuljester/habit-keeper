import * as db from "./database.js";

export async function handleLogin(req) {
	const data = await req.json()
	const loginResponse = await db.login(data.name, data.password)
	return new Response(loginResponse, { status: 200, headers: {'Content-Type': 'application/json'} });
}
