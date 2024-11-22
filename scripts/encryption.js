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

	const encryptedHex = arrayToHex(encryptedData)
	return encryptedHex;
}

export async function decrypt(data, key, iv) {
	const dataArray = hexToArray(data)
	const decryptedData = await crypto.subtle.decrypt({
		name: 'AES-GCM',
		iv: iv,
	}, key,	dataArray);

	const encoder = new TextDecoder();
	const string = encoder.decode(decryptedData);

	console.log(string);
	return string;
}

export async function hashToKey(hashString) {
	const array = hexToArray(hashString)

	const key = await crypto.subtle.importKey('raw', array, {name: 'AES-GCM'}, false, ['encrypt', 'decrypt'])
	return key
}

export function nameToIV(name) {
	const array = new ArrayBuffer(16);
	const dataView = new DataView(array)
	let i = 0;
	for (i = 0; i < name.length && i < 16; i += 1) {
		dataView.setInt8(i, name.charCodeAt(i))
	}
	let j = 0;
	while (i < 16) {
		const cycleValue = dataView.getInt8(j);
		dataView.setInt8(i, cycleValue)
		i++;
		j = (j + 1) % name.length
	}
	return array
}

function hexToArray(string) {
	const array = new ArrayBuffer(Math.ceil(string.length / 2));
	const dataView = new DataView(array)
	for (let i = 0; i < string.length; i += 2) {
		dataView.setInt8(i / 2, parseInt(string[i] + string[i + 1], 16))
	}

	return array;
}

function arrayToHex(array) {
	let string = '';
	const dataView = new DataView(array);
	for (let i = 0; i < array.byteLength; i++) {
		let value = dataView.getInt8(i)
		if (value < 0) {
			value += 256
		}
		value = value.toString(16).padStart(2, '0');
		string += value
	}
	return string
}
