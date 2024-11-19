import { assert } from "jsr:@std/assert/assert";
import { generateToken, hash } from "./encryption.js";
import { Database } from "jsr:@db/sqlite";
import { now } from "./utils.js";

const db = new Database('habits.db');

db.prepare('PRAGMA foreign_keys = ON;').run();

db.prepare('DROP TABLE IF EXISTS token;').run(); // WARNING!!! REMEMBER TO DELETE IT LATER!!!
db.prepare('DROP TABLE IF EXISTS profile;').run(); // WARNING!!! REMEMBER TO DELETE IT LATER!!!

db.prepare(`CREATE TABLE IF NOT EXISTS profile (
	name TEXT PRIMARY KEY,
	password TEXT NOT NULL,
	admin BOOLEAN DEFAULT 0
);`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS token (
	token TEXT PRIMARY KEY,
	profileName TEXT NOT NULL,
	expirationDate INTEGER NOT NULL,
	FOREIGN KEY (profileName) REFERENCES profile(name) ON UPDATE CASCADE ON DELETE CASCADE
);`).run();


const validatingRegEx = /.+/g // idk even know if this export works as intended
const nameRegEx = /\w+/g
const passwordRegEx = validatingRegEx

export function validateString(string, regex = validatingRegEx) {
	const matches = string.match(regex);
	if (matches.length != 1) {
		return 1
	}
	if (matches[0].length != string.length) {
		return 2
	}

	return 0
}

export async function addProfile(name, password, admin = 0) {
	if (profileExists(name)) {
		return 1;
	}
	if (validateString(name, nameRegEx) != 0) {
		return 2
	}
	if (validateString(password, passwordRegEx) != 0) {
		return 3
	}
	const hashedPassword = await hash(password);
	db.prepare('INSERT INTO profile (name, password, admin) VALUES (?, ?, ?)').run(name, hashedPassword, admin);
	return 0;
}

export function profiles() {
	return db.prepare('SELECT * FROM profile').all();
}

export function profile(name) {
	const p = db.prepare('SELECT * FROM profile WHERE name = ?').all(name)
	assert(p.length <= 1, "more than one profile with same name")
	return p[0];
}

export function profileExists(name) {
	assert(name != undefined, 'name not provided');
	return profile(name) !== undefined;
}

export async function updateProfile(name, newName, password, admin = 0) {
	const hashedPassword = await hash(password);
	db.prepare('UPDATE profile SET name = ?, password = ?, admin = ? WHERE name = ?').run(newName, hashedPassword, admin, name)
}

export async function login(name, password) {
	const p = profile(name);
	if (!p) {
		return 1;
	}
	const hashedPassword = await hash(password)
	if (p['password'] == hashedPassword) {
		return 0
	}
	return 2;
}

export function createToken(name) {
	assert(name != undefined, 'name not provided');
	const token = generateToken()
	let expirationDate = now();
	const maxAge = 3 * (60);
	expirationDate += maxAge;
	db.prepare('INSERT INTO token (profileName, token, expirationDate) VALUES (?, ?, ?)').run(name, token, expirationDate);
	return {token, expirationDate, maxAge}
}

export function verifyToken(token) {
	assert(token != undefined, 'token not provided');
	const rows = db.prepare('SELECT * FROM token WHERE token = ?').all(token);
	assert(rows.length <= 1, "more than one token with same value")
	if (rows.length == 0) {
		return null;
	}
	if (rows[0]['expirationDate'] < now()) {
		db.prepare('DELETE FROM token WHERE token = ?').run(token);
		return null;
	}
	return rows[0].profileName;
}


