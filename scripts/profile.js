import * as db from "./database.js";

export async function handleLogin(req) {
	const data = await req.json()
	const loginResponse = await db.login(data.name, data.password)

	const res = {
		code: loginResponse,
		token: null,
	}

	if (loginResponse != 0) {
		return new Response(JSON.stringify(res), { status: 401, headers: {'Content-Type': 'application/json'} });
	}

	const token = db.createToken(data.name);
	res.token = token;

	return new Response(JSON.stringify(res), { status: 200, headers: {'Content-Type': 'application/json'} });
}

