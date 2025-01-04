import { crypto } from "jsr:@std/crypto/crypto";
import { encodeHex } from "jsr:@std/encoding/hex";

/**
	* @param {String} string - string to be hashed
	* @returns {Promise<string>} hash
*/
export async function hash(string) {
	const data = new TextEncoder().encode(string)
	return encodeHex(await crypto.subtle.digest('SHA-256', data));
}


/**
	* @returns {String} 128 byte token
*/
export function generateToken() {
	const array = new Uint8Array(128);
	crypto.getRandomValues(array);
	const token = [...array].map(byte => byte.toString(16).padStart(2, '0')).join('');
	return token;
}

/**
	* @param {String} string - data to encrypt
	* @param {ArrayBuffer} iv - initial vectors of encryption
	* @param {CryptoKey} key - encryption key
	* @returns {String} encrypted string
*/
export async function encrypt(string, iv, key) {
	const encoder = new TextEncoder();
	const data = encoder.encode(string);

	const encryptedData = await crypto.subtle.encrypt({
		name: 'AES-GCM',
		iv: iv,
	}, key,	data);

	const encryptedHex = arrayToHex(encryptedData)
	return encryptedHex;
}


/**
	* @param {String} data - string to decrypt
	* @param {ArrayBuffer} iv - initial vectors of encryption
	* @param {CryptoKey} key - encryption key
	* @returns {String} decrypted data
*/
export async function decrypt(data, iv, key) {
	const dataArray = hexToArray(data)
	const decryptedData = await crypto.subtle.decrypt({
		name: 'AES-GCM',
		iv: iv,
	}, key,	dataArray);

	const encoder = new TextDecoder();
	const string = encoder.decode(decryptedData);

	return string;
}


/**
	* @param {String} hashString - hash
	* @returns {CryptoKey} key used in encryption
*/
export async function hashToKey(hashString) {
	const array = hexToArray(hashString)

	const key = await crypto.subtle.importKey('raw', array, {name: 'AES-GCM'}, false, ['encrypt', 'decrypt'])
	return key
}


/**
	* @param {String} name - user name
	* @returns {ArrayBuffer} initial vectors used in encryption
*/
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


/**
	* @param {String} string - two digit hex numbers
	* @returns {ArrayBuffer} converted string of hex numbers
*/
function hexToArray(string) {
	const array = new ArrayBuffer(Math.ceil(string.length / 2));
	const dataView = new DataView(array)
	for (let i = 0; i < string.length; i += 2) {
		dataView.setInt8(i / 2, parseInt(string[i] + string[i + 1], 16))
	}

	return array;
}


/**
	* @param {ArrayBuffer} array - array filled with 8-bit integers
	* @returns {String} bytes converted to hex
*/
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
