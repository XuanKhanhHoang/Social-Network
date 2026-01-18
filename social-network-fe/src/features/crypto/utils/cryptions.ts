import nacl from 'tweetnacl';
import {
    encodeBase64,
    decodeBase64,
    encodeUTF8,
    decodeUTF8,
} from 'tweetnacl-util';

export const createIdentity = () => {
  const pair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(pair.publicKey),
    secretKey: pair.secretKey,
  };
};

export const getSharedKey = (
  mySecretKey: Uint8Array,
  theirPublicKeyStr: string
) => {
  const theirBytes = decodeBase64(theirPublicKeyStr);
  return nacl.box.before(theirBytes, mySecretKey);
};

// === 1-1 Text Encryption ===
export const encryptText = (text: string, sharedKey: Uint8Array) => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const msgBytes = decodeUTF8(text);
  const encrypted = nacl.box.after(msgBytes, nonce, sharedKey);

  return {
    nonce: encodeBase64(nonce),
    cipherText: encodeBase64(encrypted),
  };
};

export const decryptText = (
  nonceStr: string,
  cipherText: string,
  sharedKey: Uint8Array
) => {
  try {
    const nonce = decodeBase64(nonceStr);
    const ciphertext = decodeBase64(cipherText);
    const decrypted = nacl.box.open.after(ciphertext, nonce, sharedKey);
    return decrypted ? encodeUTF8(decrypted) : null;
  } catch {
    return null;
  }
};

// === 1-1 File Encryption ===
export const encryptFile = async (file: File, sharedKey: Uint8Array) => {
  const buffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(buffer);

  const nonce = nacl.randomBytes(nacl.box.nonceLength);

  const encryptedBytes = nacl.box.after(fileBytes, nonce, sharedKey);

  return {
    nonce: encodeBase64(nonce),
    blob: new Blob([encryptedBytes as unknown as BlobPart]),
  };
};

export const decryptFile = (
  encryptedBuffer: ArrayBuffer,
  nonceStr: string,
  sharedKey: Uint8Array
) => {
  try {
    const nonce = decodeBase64(nonceStr);
    const ciphertext = new Uint8Array(encryptedBuffer);

    const decrypted = nacl.box.open.after(ciphertext, nonce, sharedKey);

    if (!decrypted) return null;
    return new Blob([decrypted as unknown as BlobPart]);
  } catch {
    return null;
  }
};

// === Group Text Encryption (Multi-Encrypt) ===
export const encryptTextMulti = (
  text: string,
  recipients: { id: string; sharedKey: Uint8Array }[]
) => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const msgBytes = decodeUTF8(text);
  const encryptedContents: Record<string, string> = {};

  recipients.forEach(({ id, sharedKey }) => {
    const encrypted = nacl.box.after(msgBytes, nonce, sharedKey);
    encryptedContents[id] = encodeBase64(encrypted);
  });

  return { nonce: encodeBase64(nonce), encryptedContents };
};

export const decryptGroupText = (
  nonceStr: string,
  encryptedContents: Record<string, string>,
  myId: string,
  sharedKey: Uint8Array
) => {
  const myContent = encryptedContents[myId];
  if (!myContent) return null;
  return decryptText(nonceStr, myContent, sharedKey);
};

// === Group File Encryption (Envelope Encryption) ===
export const encryptFileEnvelope = async (
  file: File,
  recipients: { id: string; sharedKey: Uint8Array }[]
) => {
  // Generate random CEK (Content Encryption Key)
  const cek = nacl.randomBytes(nacl.secretbox.keyLength);
  const buffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(buffer);

  // Encrypt file with CEK using secretbox
  const mediaNonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const encryptedFile = nacl.secretbox(fileBytes, mediaNonce, cek);

  // Wrap CEK for each recipient
  const keyNonce = nacl.randomBytes(nacl.box.nonceLength);
  const encryptedFileKeys: Record<string, string> = {};

  recipients.forEach(({ id, sharedKey }) => {
    const wrappedKey = nacl.box.after(cek, keyNonce, sharedKey);
    encryptedFileKeys[id] = encodeBase64(wrappedKey);
  });

  return {
    blob: new Blob([encryptedFile as unknown as BlobPart]),
    mediaNonce: encodeBase64(mediaNonce),
    keyNonce: encodeBase64(keyNonce),
    encryptedFileKeys,
  };
};

export const decryptFileEnvelope = (
  encryptedBuffer: ArrayBuffer,
  mediaNonceStr: string,
  keyNonceStr: string,
  encryptedFileKeys: Record<string, string>,
  myId: string,
  sharedKey: Uint8Array
) => {
  try {
    const myWrappedKey = encryptedFileKeys[myId];
    if (!myWrappedKey) return null;

    // Unwrap CEK
    const keyNonce = decodeBase64(keyNonceStr);
    const wrappedKeyBytes = decodeBase64(myWrappedKey);
    const cek = nacl.box.open.after(wrappedKeyBytes, keyNonce, sharedKey);
    if (!cek) return null;

    // Decrypt file with CEK
    const mediaNonce = decodeBase64(mediaNonceStr);
    const ciphertext = new Uint8Array(encryptedBuffer);
    const decrypted = nacl.secretbox.open(ciphertext, mediaNonce, cek);

    return decrypted ? new Blob([decrypted as unknown as BlobPart]) : null;
  } catch {
    return null;
  }
};

// === Key Vault (PIN-based encryption) ===
const deriveKeyFromPin = async (pin: string, salt: Uint8Array) => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const keyParams = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const rawKey = await window.crypto.subtle.exportKey('raw', keyParams);
  return new Uint8Array(rawKey);
};

export const createKeyVault = async (secretKey: Uint8Array, pin: string) => {
  const salt = nacl.randomBytes(16);
  const pinKey = await deriveKeyFromPin(pin, salt);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);

  const ciphertext = nacl.secretbox(secretKey, nonce, pinKey);

  return {
    salt: encodeBase64(salt),
    iv: encodeBase64(nonce),
    ciphertext: encodeBase64(ciphertext),
  };
};
export const restoreKeyVault = async (
  vault: { salt: string; iv: string; ciphertext: string },
  pin: string
) => {
  try {
    const salt = decodeBase64(vault.salt);
    const nonce = decodeBase64(vault.iv);
    const ciphertext = decodeBase64(vault.ciphertext);

    const pinKey = await deriveKeyFromPin(pin, salt);
    const secretKey = nacl.secretbox.open(ciphertext, nonce, pinKey);
    if (!secretKey) return null;
    return secretKey;
  } catch {
    return null;
  }
};

