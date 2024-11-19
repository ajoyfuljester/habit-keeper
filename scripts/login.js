import * as db from "./database.js";

export async function handleLogin(req) {
	const data = await req.json()
	const loginResponse = await db.login(data.name, data.password)

	const res = {
		code: loginResponse,
	}

	if (loginResponse != 0) {
		return new Response(JSON.stringify(res), { status: 401, headers: {'Content-Type': 'application/json'} });
	}

	const token = db.createToken(data.name);

	return new Response(JSON.stringify(res), { status: 200, headers: {
		'Content-Type': 'application/json',
		'Set-Cookie': `token=${token.token}; Max-Age=${token.maxAge}; SameSite=Strict; Secure; Path=/; HttpOnly`,
	}});
}

