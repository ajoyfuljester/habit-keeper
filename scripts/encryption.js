import { crypto } from "jsr:@std/crypto/crypto";
import { encodeHex } from "jsr:@std/encoding/hex";

export async function hash(string) {
	const data = new TextEncoder().encode(string)
	return encodeHex(await crypto.subtle.digest('SHA-256', data));
}

export function generateToken() {
	const array = new Uint8Array(128);
	crypto.getRandomValues(array);
	const token = [...array].map(byte => byte.toString(16).padStart(2, '0')).join('');
	return token;
}

export async function encrypt(string, key, iv) {
	const encoder = new TextEncoder();
	const data = encoder.encode(string);

	const encryptedData = await crypto.subtle.encrypt({
		name: 'AES-GCM',
		iv: iv,
	}, key,	data);

	console.log(encryptedData);
	return encryptedData;
}

export async function decrypt(data, key, iv) {
	const decryptedData = await crypto.subtle.decrypt({
		name: 'AES-GCM',
		iv: iv,
	}, key,	data);

	const encoder = new TextDecoder();
	const string = encoder.decode(decryptedData);

	console.log(string);
	return string;
}

export async function hashToKey(hash) {
	const arr = new ArrayBuffer(32);
	const dataView = new DataView(arr)
	for (let i = 0; i < hash.length; i += 2) {
		dataView.setInt8(i / 2, parseInt(hash[i] + hash[i + 1], 16))
	}
	const key = await crypto.subtle.importKey('raw', arr, {name: 'AES-GCM'}, false, ['encrypt', 'decrypt'])
	return key
}

export async function nameToIV(name) {

}
