import { crypto } from "jsr:@std/crypto/crypto";
import { encodeHex } from "jsr:@std/encoding/hex";

export async function hash(string) {
	const data = new TextEncoder().encode(string)
	return encodeHex(await crypto.subtle.digest('MD5', data));
}

