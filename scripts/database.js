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


/**
	* @typedef {Object} User
	* @property {String} name - user name
	* @property {String} password - user password
	* @property {Number} adminMode - admin permission mode
*/
db.prepare(`CREATE TABLE IF NOT EXISTS user (
	name TEXT PRIMARY KEY,
	password TEXT NOT NULL,
	adminMode INT NOT NULL DEFAULT 0
);`).run();

/**
	* @typedef {Object} Token
	* @property {String} token - randomly generated string of 128 bytes of hex numbers
	* @property {String} userName - user name ({@link User})
	* @property {Number} expirationDate - date of expiration of the token in unix timestamp in seconds
*/
db.prepare(`CREATE TABLE IF NOT EXISTS token (
	token TEXT PRIMARY KEY,
	userName TEXT NOT NULL,
	expirationDate INTEGER NOT NULL,
	FOREIGN KEY (userName) REFERENCES user(name) ON UPDATE CASCADE ON DELETE CASCADE
);`).run();


/**
	* @typedef {Object} Permission
	* @property {String} owner - owner of the data, has all permissions over its data ({@link User})
	* @property {String} guest - receiver of the permission, has no permissions over the data of `owner`, unless explicitly set ({@link User})
	* @property {Number} accessMode - permission mode given by `owner` to `guest`
*/
db.prepare(`CREATE TABLE IF NOT EXISTS permission (
	owner TEXT NOT NULL,
	guest TEXT NOT NULL,
	accessMode INT NOT NULL DEFAULT 0,
	FOREIGN KEY (owner) REFERENCES user(name) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (guest) REFERENCES user(name) ON UPDATE CASCADE ON DELETE CASCADE,
	PRIMARY KEY (owner, guest)
);`).run();




/**
	* @param {String} name - user name
	* @param {String} password - user password
	* @param {Number} [adminMode=0] - admin permission mode
	* @returns {Promise<0 | 1 | 2 | 3>} error code
	* `0` - success
	* `1` - user already exists
	* `2` - name is not valid
	* `3` - password is not valid
*/
export async function addUser(name, password, adminMode = 0) {
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
	db.prepare('INSERT INTO user (name, password, adminMode) VALUES (?, ?, ?)').run(name, hashedPassword, adminMode);
	return 0;
}


/**
	* @returns {User[]} list of users and their informations in the database
*/
export function users() {
	return db.prepare('SELECT * FROM user').all();
}


/**
	* @param {String} name - user name
	* @returns {User | undefined} user information
*/
export function user(name) {
	const u = db.prepare('SELECT * FROM user WHERE name = ?').all(name)
	return u[0];
}


/**
	* @param {String} name - user name
	* @returns {Boolean} does the user exist?
*/
export function userExists(name) {
	return user(name) !== undefined;
}


/**
	* @deprecated should rewrite this before using
*/
export async function updateUser(name, newName, password, admin = 0) { // TODO: rewrite this (separate params, like in 'tokens'), check if newName is taken
	const hashedPassword = await hash(password);
	db.prepare('UPDATE user SET name = ?, password = ?, adminMode = ? WHERE name = ?').run(newName, hashedPassword, admin, name)
}



/**
	* @param {String} name - user name
	* @param {String} password - user password
	* @returns {Promise<0 | 1 | 2>} error code
	* `0` - success
	* `1` - user does not exist
	* `2` - password is incorrect
*/
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


/**
	* @typedef {Object} TokenObject
	* @property {String} token - literal token string
	* @property {Number} expirationDate - unix timestamp in seconds
	* @property {Number} maxAge - length of time the token is valid
	*
	* @param {String} name - user name
	* @returns {TokenObject} {@link TokenObject}
*/
export function createToken(name) {
	const token = generateToken()
	let expirationDate = now();
	const maxAge = 3 * (60);
	expirationDate += maxAge;
	db.prepare('INSERT INTO token (userName, token, expirationDate) VALUES (?, ?, ?)').run(name, token, expirationDate);
	return {token, expirationDate, maxAge}
}


/**
	* @param {String} token - token string to be verified
	* @returns {String | null} user name of the owner of the token or `null` if not valid
	* @todo rewrite this to 2 functions (verifyToken, tokenOwner)
*/
export function verifyToken(token) {
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


/**
	* @param {String} owner - user name of the owner of the permission
	* @param {String} guest - user name of the receiver of the permission
	* @param {Number} neededMode - permission mode needed for an operation
	* @returns {Boolean} does `guest` have the permission to perform an operation on the data of `owner`
*/
export function verifyPermission(owner, guest, neededMode) {
	const rows = db.prepare('SELECT accessMode FROM permission WHERE owner = ? AND guest = ?').all(owner, guest)
	if (rows.length == 0) {
		return false;
	}
	const accessMode = rows[0].accessMode

	return (neededMode & accessMode) == neededMode
}


/**
	* @param {String} name - user name
	* @param {Number} neededMode - admin permission mode needed for an admin operation
	* @returns {Boolean} does the user have the permission to perform an admin operation
*/
export function verifyAdminPermission(name, neededMode) {
	const rows = db.prepare('SELECT adminMode FROM user WHERE name = ?').all(name)
	if (rows.length == 0) {
		return false;
	}
	const adminMode = rows[0].adminMode

	return (neededMode & adminMode) == neededMode
	
}


/**
	* @param {Object} TokenOptions - object with parameters of the database query
	* @param {Number} TokenOptions.beforeOpen - `expirationDate` less than
	* @param {Number} TokenOptions.afterOpen - `expirationDate` more than
	* @param {Number} TokenOptions.beforeClosed - `expirationDate` less than or equal
	* @param {Number} TokenOptions.afterClosed - `expirationDate` more than or equal
	* @param {String} TokenOptions.name - user name of the owner 
	* @returns {Token[]} array of {@link Token} objects retrieved from database that fulfill ALL parameters (`AND` operation)
	*
	* @see {@link Token}
*/
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
