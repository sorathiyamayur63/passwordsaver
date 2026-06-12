// In-Memory Key Store. NEVER mapped to localStorage, sessionStorage, or IndexedDB.
let _encryptionKey = null;
let _legacyEncryptionKey = null;
let _keyDerivedAt = null;

const listeners = new Set();

export const setKey = (cryptoKey, legacyCryptoKey = null) => {
  if (!(cryptoKey instanceof CryptoKey)) {
    throw new Error('Invalid key format. Expected a CryptoKey object.');
  }
  _encryptionKey = cryptoKey;
  _legacyEncryptionKey = legacyCryptoKey;
  _keyDerivedAt = Date.now();
};

export const getKey = () => {
  if (!_encryptionKey) {
    throw new Error('VAULT_LOCKED'); // Caught by UI layer to force Password prompt
  }
  return _encryptionKey;
};

export const getLegacyKey = () => {
  return _legacyEncryptionKey;
};

export const clearKey = () => {
  _encryptionKey = null;
  _legacyEncryptionKey = null;
  _keyDerivedAt = null;
};

export const isKeyLoaded = () => {
  return _encryptionKey !== null;
};

export const getKeyAge = () => {
  if (!_keyDerivedAt) return null;
  return Date.now() - _keyDerivedAt;
};

export const onVaultLocked = (callback) => {
  listeners.add(callback);
};

export const offVaultLocked = (callback) => {
  listeners.delete(callback);
};

export const emitVaultLocked = () => {
  listeners.forEach((callback) => {
    try {
      callback();
    } catch (e) {
      console.error('Error executing Vault Locked listener:', e);
    }
  });
};