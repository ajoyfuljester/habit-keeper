import { profile, verifyToken } from "./database.js";
import { getCookies } from "jsr:@std/http/cookie"

function data(name) {
	return profile(name)
}

export function handleData(req) {
	const token = getCookies(req.headers).token;
	const name = verifyToken(token);
	console.log(name)
	return new Response('Hi ' + (name ?? '**NO ONE**') + ', if you are someone, you have a cookie!', {status: 200})
}
