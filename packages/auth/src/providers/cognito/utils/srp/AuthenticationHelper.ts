// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Sha256 as jsSha256 } from '@aws-crypto/sha256-js';
import BigInteger from './BigInteger';
import { toHex, fromHex } from './helpers';
import WordArray from './WordArray';
import { toBase64 } from '@smithy/util-base64';
import { AuthError } from '../../../../errors/AuthError';

export type BigInteger = typeof BigInteger & {
	subtract: Function;
	add: Function;
	multiply: Function;
	mod: Function;
	modPow: Function;
	equals: Function;
};

const SHORT_TO_HEX: Record<string, string> = {};
const HEX_TO_SHORT: Record<string, number> = {};

for (let i = 0; i < 256; i++) {
	let encodedByte = i.toString(16).toLowerCase();
	if (encodedByte.length === 1) {
		encodedByte = `0${encodedByte}`;
	}

	SHORT_TO_HEX[i] = encodedByte;
	HEX_TO_SHORT[encodedByte] = i;
}

/**
 * Returns a Uint8Array with a sequence of random nBytes
 *
 * @param {number} nBytes
 * @returns {Uint8Array} fixed-length sequence of random bytes
 */
function randomBytes(nBytes: number): Uint8Array {
	const str = new WordArray().random(nBytes).toString();

	return fromHex(str);
}

/**
 * Returns a Uint8Array with a sequence of random nBytes
 *
 * @param {number} nBytes
 * @returns {Uint8Array} fixed-length sequence of random bytes
 */

/**
 * Tests if a hex string has it most significant bit set (case-insensitive regex)
 */
const HEX_MSB_REGEX = /^[89a-f]/i;

const initN =
	'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1' +
	'29024E088A67CC74020BBEA63B139B22514A08798E3404DD' +
	'EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245' +
	'E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED' +
	'EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D' +
	'C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F' +
	'83655D23DCA3AD961C62F356208552BB9ED529077096966D' +
	'670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B' +
	'E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9' +
	'DE2BCBF6955817183995497CEA956AE515D2261898FA0510' +
	'15728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64' +
	'ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7' +
	'ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6B' +
	'F12FFA06D98A0864D87602733EC86A64521F2B18177B200C' +
	'BBE117577A615D6C770988C0BAD946E208E24FA074E5AB31' +
	'43DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF';

const newPasswordRequiredChallengeUserAttributePrefix = 'userAttributes.';

/** @class */
export default class AuthenticationHelper {
	encoder = new TextEncoder();
	smallAValue: BigInteger;
	infoBits: Uint8Array;
	poolName: string;
	largeAValue?: BigInteger;
	randomPassword?: string;
	SaltToHashDevices?: string;
	verifierDevices?: string;
	UHexHash?: string;
	UValue?: BigInteger;
	N: BigInteger;
	g: BigInteger;
	k: BigInteger;
	/**
	 * Constructs a new AuthenticationHelper object
	 * @param {string} PoolName Cognito user pool name.
	 */
	constructor(PoolName: string) {
		this.N = new (BigInteger as any)(initN, 16);
		this.g = new (BigInteger as any)('2', 16);
		this.k = new (BigInteger as any)(
			this.hexHash(`${this.padHex(this.N)}${this.padHex(this.g)}`),
			16
		);

		this.smallAValue = this.generateRandomSmallA();
		this.getLargeAValue(() => {});

		this.infoBits = this.encoder.encode('Caldera Derived Key');

		this.poolName = PoolName;
	}

	getLargeA(): BigInteger {
		if (!this.largeAValue) {
			throw new AuthError({
				name: 'EmptyBigIntegerLargeAValue',
				message: 'largeAValue was not defined',
			});
		}
		return this.largeAValue;
	}
	getUValue(): BigInteger {
		if (!this.UValue)
			throw new AuthError({
				name: 'EmptyBigIntegerUValue',
				message: 'UValue is empty',
			});
		return this.UValue;
	}
	/**
	 * @returns {BigInteger} small A, a random number
	 */
	getSmallAValue() {
		return this.smallAValue;
	}

	/**
	 * @param {nodeCallback<BigInteger>} callback Called with (err, largeAValue)
	 * @returns {void}
	 */
	getLargeAValue(callback: Function): void {
		if (this.largeAValue) {
			callback(null, this.largeAValue);
		} else {
			this.calculateA(
				this.smallAValue,
				(err: unknown, largeAValue: BigInteger) => {
					if (err) {
						callback(err, null);
					}

					this.largeAValue = largeAValue;
					callback(null, this.largeAValue);
				}
			);
		}
	}

	/**
	 * helper function to generate a random big integer
	 * @returns {BigInteger} a random value.
	 * @private
	 */
	generateRandomSmallA(): BigInteger {
		// This will be interpreted as a postive 128-bit integer

		const hexRandom = toHex(randomBytes(128));

		const randomBigInt = new (BigInteger as any)(hexRandom, 16);

		// There is no need to do randomBigInt.mod(this.N - 1) as N (3072-bit) is > 128 bytes (1024-bit)

		return randomBigInt;
	}

	/**
	 * helper function to generate a random string
	 * @returns {string} a random value.
	 * @private
	 */
	generateRandomString(): string {
		return toBase64(randomBytes(40));
	}

	/**
	 * @returns {string} Generated random value included in password hash.
	 */
	getRandomPassword(): string {
		if (!this.randomPassword) {
			throw new AuthError({
				name: 'EmptyBigIntegerRandomPassword',
				message: 'random password is empty',
			});
		}
		return this.randomPassword;
	}

	/**
	 * @returns {string} Generated random value included in devices hash.
	 */
	getSaltToHashDevices(): string {
		if (!this.SaltToHashDevices) {
			throw new AuthError({
				name: 'EmptyBigIntegerSaltToHashDevices',
				message: 'SaltToHashDevices is empty',
			});
		}
		return this.SaltToHashDevices;
	}

	/**
	 * @returns {string} Value used to verify devices.
	 */
	getVerifierDevices(): string {
		if (!this.verifierDevices) {
			throw new AuthError({
				name: 'EmptyBigIntegerVerifierDevices',
				message: 'verifyDevices is empty',
			});
		}
		return this.verifierDevices;
	}

	/**
	 * Generate salts and compute verifier.
	 * @param {string} deviceGroupKey Devices to generate verifier for.
	 * @param {string} username User to generate verifier for.
	 * @param {nodeCallback<null>} callback Called with (err, null)
	 * @returns {void}
	 */
	generateHashDevice(
		deviceGroupKey: string,
		username: string,
		callback: Function
	): void {
		this.randomPassword = this.generateRandomString();
		const combinedString = `${deviceGroupKey}${username}:${this.randomPassword}`;
		const hashedString = this.hash(combinedString);

		const hexRandom = toHex(randomBytes(16));

		// The random hex will be unambiguously represented as a postive integer
		this.SaltToHashDevices = this.padHex(
			new (BigInteger as any)(hexRandom, 16)
		);

		this.g.modPow(
			new (BigInteger as any)(
				this.hexHash(this.SaltToHashDevices + hashedString),
				16
			),
			this.N,
			(err: unknown, verifierDevicesNotPadded: BigInteger) => {
				if (err) {
					callback(err, null);
				}

				this.verifierDevices = this.padHex(verifierDevicesNotPadded);
				callback(null, null);
			}
		);
	}

	/**
	 * Calculate the client's public value A = g^a%N
	 * with the generated random number a
	 * @param {BigInteger} a Randomly generated small A.
	 * @param {nodeCallback<BigInteger>} callback Called with (err, largeAValue)
	 * @returns {void}
	 * @private
	 */
	calculateA(a: BigInteger, callback: Function) {
		this.g.modPow(a, this.N, (err: unknown, A: BigInteger) => {
			if (err) {
				callback(err, null);
			}

			if (A.mod(this.N).equals(BigInteger.ZERO)) {
				callback(new Error('Illegal paramater. A mod N cannot be 0.'), null);
			}

			callback(null, A);
		});
	}

	/**
	 * Calculate the client's value U which is the hash of A and B
	 * @param {BigInteger} A Large A value.
	 * @param {BigInteger} B Server B value.
	 * @returns {BigInteger} Computed U value.
	 * @private
	 */
	calculateU(A: BigInteger, B: BigInteger): BigInteger {
		this.UHexHash = this.hexHash(this.padHex(A) + this.padHex(B));
		const finalU = new (BigInteger as any)(this.UHexHash, 16);

		return finalU;
	}

	/**
	 * Calculate a hash from a bitArray
	 * @param {Uint8Array} buf Value to hash.
	 * @returns {String} Hex-encoded hash.
	 * @private
	 */
	hash(buf: any): string {
		const awsCryptoHash = new jsSha256();
		awsCryptoHash.update(buf);

		const resultFromAWSCrypto = awsCryptoHash.digestSync();
		const hashHexFromUint8 = toHex(resultFromAWSCrypto);
		return new Array(64 - hashHexFromUint8.length).join('0') + hashHexFromUint8;
	}

	/**
	 * Calculate a hash from a hex string
	 * @param {String} hexStr Value to hash.
	 * @returns {String} Hex-encoded hash.
	 * @private
	 */
	hexHash(hexStr: string): string {
		return this.hash(fromHex(hexStr));
	}

	/**
	 * Standard hkdf algorithm
	 * @param {Uint8Array} ikm Input key material.
	 * @param {Uint8Array} salt Salt value.
	 * @returns {Uint8Array} Strong key material.
	 * @private
	 */
	computehkdf(ikm: Uint8Array, salt: Uint8Array): Uint8Array {
		const stringOne = this.encoder.encode(String.fromCharCode(1));
		const bufConcat = new Uint8Array(
			this.infoBits.byteLength + stringOne.byteLength
		);
		bufConcat.set(this.infoBits, 0);
		bufConcat.set(stringOne, this.infoBits.byteLength);

		const awsCryptoHash = new jsSha256(salt);
		awsCryptoHash.update(ikm);

		const resultFromAWSCryptoPrk = awsCryptoHash.digestSync();

		const awsCryptoHashHmac = new jsSha256(resultFromAWSCryptoPrk);
		awsCryptoHashHmac.update(bufConcat);
		const resultFromAWSCryptoHmac = awsCryptoHashHmac.digestSync();

		const hashHexFromAWSCrypto = resultFromAWSCryptoHmac;

		const currentHex = hashHexFromAWSCrypto.slice(0, 16);

		return currentHex;
	}

	/**
	 * Calculates the final hkdf based on computed S value, and computed U value and the key
	 * @param {String} username Username.
	 * @param {String} password Password.
	 * @param {BigInteger} serverBValue Server B value.
	 * @param {BigInteger} salt Generated salt.
	 * @param {nodeCallback<Uint8Array>} callback Called with (err, hkdfValue)
	 * @returns {void}
	 */
	getPasswordAuthenticationKey(
		username: string,
		password: string,
		serverBValue: BigInteger,
		salt: BigInteger,
		callback: Function
	) {
		if (serverBValue.mod(this.N).equals(BigInteger.ZERO)) {
			throw new Error('B cannot be zero.');
		}

		this.UValue = this.calculateU(this.getLargeA(), serverBValue);

		if (this.UValue.equals(BigInteger.ZERO)) {
			throw new Error('U cannot be zero.');
		}

		const usernamePassword = `${this.poolName}${username}:${password}`;
		const usernamePasswordHash = this.hash(usernamePassword);

		const xValue = new (BigInteger as any)(
			this.hexHash(this.padHex(salt) + usernamePasswordHash),
			16
		);
		this.calculateS(
			xValue,
			serverBValue,
			(err: unknown, sValue: BigInteger) => {
				if (err) {
					callback(err, null);
				}

				const hkdf = this.computehkdf(
					fromHex(this.padHex(sValue)),
					fromHex(this.padHex(this.getUValue()))
				);

				callback(null, hkdf);
			}
		);
	}

	/**
	 * Calculates the S value used in getPasswordAuthenticationKey
	 * @param {BigInteger} xValue Salted password hash value.
	 * @param {BigInteger} serverBValue Server B value.
	 * @param {nodeCallback<string>} callback Called on success or error.
	 * @returns {void}
	 */
	calculateS(
		xValue: BigInteger,
		serverBValue: BigInteger,
		callback: Function
	): void {
		this.g.modPow(xValue, this.N, (err: unknown, gModPowXN: Function) => {
			if (err) {
				callback(err, null);
			}

			const intValue2 = serverBValue.subtract(this.k.multiply(gModPowXN));
			intValue2.modPow(
				this.smallAValue.add(this.getUValue().multiply(xValue)),
				this.N,
				(err2: unknown, result: BigInteger) => {
					if (err2) {
						callback(err2, null);
					}
					callback(null, result.mod(this.N));
				}
			);
		});
	}

	/**
	 * Return constant newPasswordRequiredChallengeUserAttributePrefix
	 * @return {newPasswordRequiredChallengeUserAttributePrefix} constant prefix value
	 */
	getNewPasswordRequiredChallengeUserAttributePrefix() {
		return newPasswordRequiredChallengeUserAttributePrefix;
	}

	/**
	 * Returns an unambiguous, even-length hex string of the two's complement encoding of an integer.
	 *
	 * It is compatible with the hex encoding of Java's BigInteger's toByteArray(), wich returns a
	 * byte array containing the two's-complement representation of a BigInteger. The array contains
	 * the minimum number of bytes required to represent the BigInteger, including at least one sign bit.
	 *
	 * Examples showing how ambiguity is avoided by left padding with:
	 * 	"00" (for positive values where the most-significant-bit is set)
	 *  "FF" (for negative values where the most-significant-bit is set)
	 *
	 * padHex(bigInteger.fromInt(-236))  === "FF14"
	 * padHex(bigInteger.fromInt(20))    === "14"
	 *
	 * padHex(bigInteger.fromInt(-200))  === "FF38"
	 * padHex(bigInteger.fromInt(56))    === "38"
	 *
	 * padHex(bigInteger.fromInt(-20))   === "EC"
	 * padHex(bigInteger.fromInt(236))   === "00EC"
	 *
	 * padHex(bigInteger.fromInt(-56))   === "C8"
	 * padHex(bigInteger.fromInt(200))   === "00C8"
	 *
	 * @param {BigInteger} bigInt Number to encode.
	 * @returns {String} even-length hex string of the two's complement encoding.
	 */
	padHex(bigInt: BigInteger): string {
		if (!(bigInt instanceof BigInteger)) {
			throw new Error('Not a BigInteger');
		}

		const isNegative = (bigInt as any).compareTo(BigInteger.ZERO) < 0;

		/* Get a hex string for abs(bigInt) */
		let hexStr = (bigInt as any).abs().toString(16);

		/* Pad hex to even length if needed */
		hexStr = hexStr.length % 2 !== 0 ? `0${hexStr}` : hexStr;

		/* Prepend "00" if the most significant bit is set */
		hexStr = HEX_MSB_REGEX.test(hexStr) ? `00${hexStr}` : hexStr;

		if (isNegative) {
			/* Flip the bits of the representation */
			const invertedNibbles = hexStr
				.split('')
				.map((x: string) => {
					const invertedNibble = ~parseInt(x, 16) & 0xf;
					return '0123456789ABCDEF'.charAt(invertedNibble);
				})
				.join('');

			/* After flipping the bits, add one to get the 2's complement representation */
			const flippedBitsBI = new (BigInteger as any)(invertedNibbles, 16).add(
				BigInteger.ONE
			);

			hexStr = flippedBitsBI.toString(16);

			/*
			For hex strings starting with 'FF8', 'FF' can be dropped, e.g. 0xFFFF80=0xFF80=0x80=-128
	
			Any sequence of '1' bits on the left can always be substituted with a single '1' bit
			without changing the represented value.
	
			This only happens in the case when the input is 80...00
			*/
			if (hexStr.toUpperCase().startsWith('FF8')) {
				hexStr = hexStr.substring(2);
			}
		}

		return hexStr;
	}
}
