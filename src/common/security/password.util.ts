import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const HASH_PREFIX = 'scrypt';

export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = scryptSync(password, salt, 64).toString('hex');

    return `${HASH_PREFIX}$${salt}$${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
    const [prefix, salt, hashedPassword] = storedHash.split('$');

    if (prefix !== HASH_PREFIX || !salt || !hashedPassword) {
        return false;
    }

    const derivedKey = scryptSync(password, salt, 64).toString('hex');
    const storedBuffer = Buffer.from(hashedPassword, 'hex');
    const derivedBuffer = Buffer.from(derivedKey, 'hex');

    if (storedBuffer.length !== derivedBuffer.length) {
        return false;
    }

    return timingSafeEqual(storedBuffer, derivedBuffer);
}