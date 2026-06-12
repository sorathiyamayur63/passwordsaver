import { 
  generateIV, 
  uint8ArrayToBase64, 
  base64ToUint8Array, 
  concatenateBuffers 
} from './utils.js';

export const encryptData = async (data, encryptionKey) => {
  const iv = generateIV();
  const encoder = new TextEncoder();
  const plaintextString = typeof data === 'object' ? JSON.stringify(data) : data.toString();
  const plaintextBytes = encoder.encode(plaintextString);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    encryptionKey,
    plaintextBytes
  );

  // AES-GCM appends the 16-byte (128-bit) auth tag to the end of the ciphertext
  const combinedArray = new Uint8Array(encryptedBuffer);
  const ciphertext = combinedArray.slice(0, combinedArray.byteLength - 16);
  const authTag = combinedArray.slice(combinedArray.byteLength - 16);

  return {
    encryptedData: uint8ArrayToBase64(ciphertext),
    iv: uint8ArrayToBase64(iv),
    authTag: uint8ArrayToBase64(authTag)
  };
};

export const decryptData = async (encryptedData, iv, authTag, encryptionKey) => {
  try {
    const ciphertextBytes = base64ToUint8Array(encryptedData);
    const ivBytes = base64ToUint8Array(iv);
    const authTagBytes = base64ToUint8Array(authTag);

    // Recombine ciphertext and authTag for Web Crypto API
    const combinedData = concatenateBuffers(ciphertextBytes, authTagBytes);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBytes, tagLength: 128 },
      encryptionKey,
      combinedData
    );

    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBuffer);

    return JSON.parse(decryptedString);
  } catch (error) {
    throw new Error('DECRYPTION_FAILED');
  }
};

export const encryptVaultItem = async (itemData, encryptionKey) => {
  const primaryEncryption = await encryptData(itemData, encryptionKey);
  
  let titleEncryption = { encryptedData: null, iv: null, authTag: null };
  if (itemData.title) {
    titleEncryption = await encryptData({ title: itemData.title }, encryptionKey);
  }

  return {
    encryptedData: primaryEncryption.encryptedData,
    iv: primaryEncryption.iv,
    authTag: primaryEncryption.authTag,
    encryptedTitle: titleEncryption.encryptedData,
    titleIv: titleEncryption.iv,
    titleAuthTag: titleEncryption.authTag
  };
};

export const decryptVaultItem = async (encryptedFields, encryptionKey, legacyKey = null) => {
  const { encryptedData, iv, authTag } = encryptedFields;
  try {
    return await decryptData(encryptedData, iv, authTag, encryptionKey);
  } catch (error) {
    if (legacyKey) {
      try {
        return await decryptData(encryptedData, iv, authTag, legacyKey);
      } catch (legacyError) {
        throw error;
      }
    }
    throw error;
  }
};

export const decryptVaultTitle = async (encryptedTitle, titleIv, titleAuthTag, encryptionKey, legacyKey = null) => {
  if (!encryptedTitle || !titleIv || !titleAuthTag) return null;
  
  try {
    const data = await decryptData(encryptedTitle, titleIv, titleAuthTag, encryptionKey);
    return data.title || null;
  } catch (error) {
    if (legacyKey) {
      try {
        const legacyData = await decryptData(encryptedTitle, titleIv, titleAuthTag, legacyKey);
        return legacyData.title || null;
      } catch (legacyError) {
        return null;
      }
    }
    return null; // Return null strictly for search/listing views instead of killing the entire UI render
  }
};