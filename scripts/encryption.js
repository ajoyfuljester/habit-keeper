import { crypto } from "jsr:@std/crypto/crypto";
import { encodeHex } from "jsr:@std/encoding/hex";

export async function hash(string) {
	const data = new TextEncoder().encode(string)
	return encodeHex(await crypto.subtle.digest('SHA-256', data));
}

export function generateToken() {
	const array = new Uint8Array(128);
	crypto.getRandomValues(array);
	const token = [...array].map(byte => byte.toString(16)).join('');
	return token;
}
