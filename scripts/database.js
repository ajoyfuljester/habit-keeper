import { assert } from "jsr:@std/assert/assert";
import { generateToken, hash } from "./encryption.js";
import { Database } from "jsr:@db/sqlite";
import { now } from "./utils.js";
import { validateName, validatePassword } from "./validation.js";

const db = new Database('habits.db');

db.prepare('PRAGMA foreign_keys = ON;').run();

db.prepare('DROP TABLE IF EXISTS token;').run(); // TODO: WARNING!!! REMEMBER TO DELETE IT LATER!!!
db.prepare('DROP TABLE IF EXISTS user;').run(); // WARNING!!! REMEMBER TO DELETE IT LATER!!!
db.prepare('DROP TABLE IF EXISTS permission;').run(); // WARNING!!! REMEMBER TO DELETE IT LATER!!!

db.prepare(`CREATE TABLE IF NOT EXISTS user (
	name TEXT PRIMARY KEY,
	password TEXT NOT NULL,
	adminMode INT NOT NULL DEFAULT 0
);`).run();

// REMEMBER expirationDate is unix timestamp in seconds
db.prepare(`CREATE TABLE IF NOT EXISTS token (
	token TEXT PRIMARY KEY,
	userName TEXT NOT NULL,
	expirationDate INTEGER NOT NULL,
	FOREIGN KEY (userName) REFERENCES user(name) ON UPDATE CASCADE ON DELETE CASCADE
);`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS permission (
	owner TEXT NOT NULL,
	guest TEXT NOT NULL,
	accessMode INT NOT NULL DEFAULT 0,
	FOREIGN KEY (owner) REFERENCES user(name) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (guest) REFERENCES user(name) ON UPDATE CASCADE ON DELETE CASCADE,
	PRIMARY KEY (owner, guest)
);`).run();



export async function addUser(name, password, admin = 0) {
	if (userExists(name)) {
		return 1;
	}
	if (validateName(name) != 0) {
		return 2
	}
	if (validatePassword(password) != 0) {
		return 3
	}
	const hashedPassword = await hash(password);
	db.prepare('INSERT INTO user (name, password, adminMode) VALUES (?, ?, ?)').run(name, hashedPassword, admin);
	return 0;
}

export function users() {
	return db.prepare('SELECT * FROM user').all();
}

export function user(name) {
	const u = db.prepare('SELECT * FROM user WHERE name = ?').all(name)
	assert(u.length <= 1, "more than one user with same name")
	return u[0];
}

export function userExists(name) {
	assert(name != undefined, 'name not provided');
	return user(name) !== undefined;
}

export async function updateUser(name, newName, password, admin = 0) { // TODO: rewrite this (separate params, like in 'tokens')
	const hashedPassword = await hash(password);
	db.prepare('UPDATE user SET name = ?, password = ?, adminMode = ? WHERE name = ?').run(newName, hashedPassword, admin, name)
}

export async function login(name, password) {
	const p = user(name);
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
	db.prepare('INSERT INTO token (userName, token, expirationDate) VALUES (?, ?, ?)').run(name, token, expirationDate);
	return {token, expirationDate, maxAge}
}

export function verifyToken(token) {
	assert(token != undefined, 'token not provided');
	const rows = db.prepare('SELECT userName, expirationDate FROM token WHERE token = ?').all(token);
	if (rows.length == 0) {
		return null;
	}
	if (rows[0]['expirationDate'] < now()) {
		db.prepare('DELETE FROM token WHERE token = ?').run(token);
		return null;
	}
	return rows[0].userName;
}


export function verifyPermission(owner, guest, neededMode) {
	const rows = db.prepare('SELECT accessMode FROM permission WHERE owner = ? AND guest = ?').all(owner, guest)
	if (rows.length == 0) {
		return false;
	}
	const accessMode = rows[0].accessMode

	return (neededMode & accessMode) == neededMode
}

export function verifyAdminPermission(name, neededMode) {
	const rows = db.prepare('SELECT adminMode FROM user WHERE name = ?').all(name)
	if (rows.length == 0) {
		return false;
	}
	const adminMode = rows[0].adminMode

	return (neededMode & adminMode) == neededMode
	
}


export function tokens({beforeOpen, afterOpen, beforeClosed, afterClosed, name}) {
	const parameters = [beforeOpen, afterOpen, beforeClosed, afterClosed, name]
	let query = 'SELECT * FROM tokens'
	if (parameters.some(x => !!x)) {
		query += ' WHERE (TRUE)' // REMEMBER parameters here need to be IN ORDER
		if (beforeOpen !== undefined) {
			query += ' AND (expirationDate < ?)'
		}
		if (afterOpen !== undefined) {
			query += ' AND (expirationDate > ?)'
		}
		if (beforeClosed !== undefined) {
			query += ' AND (expirationDate <= ?)'
		}
		if (afterClosed !== undefined) {
			query += ' AND (expirationDate >= ?)'
		}
		if (name !== undefined) {
			query += ' AND (userName = ?)'
		}
	}
	query += ';'

	const rows = db.prepare(query).all(parameters.filter(x => !!x))

	return rows
}
