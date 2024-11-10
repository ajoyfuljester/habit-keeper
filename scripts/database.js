import { assert } from "jsr:@std/assert/assert";
import { hash } from "./hash.js";
import { Database } from "jsr:@db/sqlite";

const db = new Database('habits.db');

db.prepare(`CREATE TABLE IF NOT EXISTS profile (
	name TEXT PRIMARY KEY,
	password TEXT NOT NULL,
	admin BOOLEAN DEFAULT 0
);`).run();


export async function addProfile(name, password, admin = 0) {
	if (profileExists(name)) {
		return false;
	}
	const hashedPassword = await hash(password);
	db.prepare('INSERT INTO profile (name, password, admin) VALUES (?, ?, ?)').run(name, hashedPassword, admin);
	return true;
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
	return profile(name) !== undefined;
}

export async function updateProfile(name, newName, password, admin = 0) {
	const hashedPassword = await hash(password);
	db.prepare('UPDATE profile SET name = ?, password = ?, admin = ? WHERE name = ?').run(newName, hashedPassword, admin, name)
}
