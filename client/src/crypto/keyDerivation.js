import { base64ToUint8Array, generateSalt, uint8ArrayToBase64 } from './utils.js';

export const deriveKeyBits = async (password, salt, bits = 512) => {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  
  const saltBytes = typeof salt === 'string' ? base64ToUint8Array(salt) : new Uint8Array(salt);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // 600,000 iterations strictly enforced per OWASP 2023 minimums for PBKDF2-SHA256
  return window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 600000,
      hash: 'SHA-256'
    },
    baseKey,
    bits
  );
};

export const deriveKeyFromPassword = async (password, salt) => {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  const saltBytes = typeof salt === 'string' ? base64ToUint8Array(salt) : new Uint8Array(salt);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 600000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false, // extractable: false (CRITICAL)
    ['encrypt', 'decrypt']
  );
};

export const deriveSubKeys = async (password, salt) => {
  const bits = await deriveKeyBits(password, salt, 512);
  
  // Split 512 bits into two 256-bit (32 bytes) subkeys
  const encryptionKeyBytes = new Uint8Array(bits, 0, 32);
  const authKeyBytes = new Uint8Array(bits, 32, 32);

  const encryptionKey = await window.crypto.subtle.importKey(
    'raw',
    encryptionKeyBytes,
    { name: 'AES-GCM' },
    false, // Must not be extractable
    ['encrypt', 'decrypt']
  );

  return { encryptionKey, authKeyBytes };
};

export const generateNewSalt = () => {
  const salt = generateSalt();
  return uint8ArrayToBase64(salt);
};