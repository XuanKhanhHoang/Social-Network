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
