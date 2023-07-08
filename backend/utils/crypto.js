/**
 * @file utils/crypto.js
 * @brief Provides utilities for cryptography functions like hashing or one-time key generation.
 */
const crypto = require("crypto");
const argon2 = require("argon2");

/**
 * Generates a random SHA256 hash using base 64 string (0-9, A-Z, a-z) as the
 * output.
 *
 * @returns {string} A base 64 string of the hash that was generated.
 */
function generateKey() {
	const rand = crypto.randomBytes(32);
	const hash = crypto.createHash("sha256");
	hash.update(new Date().toString() + rand.toString());
	return hash.digest().toString("base64");
}

/**
 * Generates a hash for password storage.
 * @param {String} password - "Plaintext" password
 * @param {String} salt - Random string
 * @returns A promise of a hashing function to be handled by the caller.
 */
function getPasswordHash(password, salt) {
	const hash = crypto.createHash("sha512");
	hash.update(password);
	return argon2.hash(hash.digest().toString("base64"), salt);
}

/**
 * Verifies a plaintext password against the database one
 * @param {*} passwordHash - Password hash from the data base
 * @param {*} password - "Plaintext" password
 * @returns A promise of a hashing function to be handled by the caller.
 */
function verifyPassword(passwordHash, password) {
	const hash = crypto.createHash("sha512");
	hash.update(password);
	return argon2.verify(passwordHash, hash.digest().toString("base64"));
}

/*****************************************************************************
 * Exports
 */
module.exports = {
	generateKey,
	getPasswordHash,
	verifyPassword,
};
