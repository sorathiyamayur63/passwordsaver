export const generateRandomBytes = (length) => {
  return window.crypto.getRandomValues(new Uint8Array(length));
};

export const generateSalt = () => {
  return generateRandomBytes(32); // 256-bit salt
};

export const generateIV = () => {
  return generateRandomBytes(12); // 96-bit IV recommended for AES-GCM
};

export const uint8ArrayToBase64 = (bytes) => {
  let binary = '';
  // Iterating safely prevents Maximum Call Stack Size Exceeded errors on large buffers
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const base64ToUint8Array = (base64) => {
  if (!base64) return new Uint8Array(0);
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const arrayBufferToBase64 = (buffer) => {
  return uint8ArrayToBase64(new Uint8Array(buffer));
};

export const base64ToArrayBuffer = (base64) => {
  return base64ToUint8Array(base64).buffer;
};

export const arrayBufferToHex = (buffer) => {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const hexToArrayBuffer = (hex) => {
  if (!hex) return new ArrayBuffer(0);
  const bytes = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
  return bytes.buffer;
};

export const concatenateBuffers = (...buffers) => {
  const totalLength = buffers.reduce((acc, val) => acc + val.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buffer of buffers) {
    const arr = new Uint8Array(buffer);
    result.set(arr, offset);
    offset += arr.byteLength;
  }
  return result;
};

export const bufferEqual = (a, b) => {
  const arrA = new Uint8Array(a);
  const arrB = new Uint8Array(b);
  
  if (arrA.byteLength !== arrB.byteLength) return false;
  
  // Bitwise constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < arrA.byteLength; i++) {
    result |= arrA[i] ^ arrB[i];
  }
  return result === 0;
};