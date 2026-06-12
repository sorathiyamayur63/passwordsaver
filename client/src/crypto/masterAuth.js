import { deriveSubKeys } from './keyDerivation.js';
import { setKey, clearKey, emitVaultLocked, isKeyLoaded } from './keyStore.js';

export const unlockVault = async (masterPassword, salt) => {
  try {
    const { encryptionKey } = await deriveSubKeys(masterPassword, salt);
    
    // Derive legacy key using undefined salt for backward compatibility with items encrypted during the register bug
    let legacyEncryptionKey = null;
    try {
      const legacyRes = await deriveSubKeys(masterPassword, undefined);
      legacyEncryptionKey = legacyRes.encryptionKey;
    } catch (e) {
      // Ignore if legacy derivation fails
    }

    setKey(encryptionKey, legacyEncryptionKey);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * The plaintext password travels over HTTPS strictly for Argon2id server-side verification.
 * The ENCRYPTION KEY is derived separately on the client from the same password and salt.
 * The encryption key is NEVER sent to the server.
 */
export const prepareMasterPasswordForAuth = (masterPassword) => {
  return masterPassword;
};

export const lockVault = () => {
  clearKey();
  emitVaultLocked();
};

export const setupIdleTimeout = (timeoutMs = 30 * 60 * 1000) => {
  let timeoutId;

  const resetTimer = () => {
    if (timeoutId) clearTimeout(timeoutId);
    // Only set timer if the vault is currently unlocked
    if (isVaultUnlocked()) {
      timeoutId = setTimeout(() => {
        lockVault();
      }, timeoutMs);
    }
  };

  const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
  
  const handleActivity = () => resetTimer();

  activityEvents.forEach(event => {
    document.addEventListener(event, handleActivity, { passive: true });
  });

  resetTimer();

  // Return cleanup function for React useEffect unmounting
  return () => {
    if (timeoutId) clearTimeout(timeoutId);
    activityEvents.forEach(event => {
      document.removeEventListener(event, handleActivity);
    });
  };
};

export const isVaultUnlocked = () => {
  return isKeyLoaded();
};