import { StateCreator } from 'zustand';
import { keyStorage } from '../services/key-storage.service';

export interface KeyVault {
  salt: string;
  iv: string;
  ciphertext: string;
}

export interface CryptoSlice {
  keyVault: KeyVault | null;
  mySecretKey: Uint8Array | null;

  setKeyVault: (vault: KeyVault | null) => void;
  setSecretKey: (key: Uint8Array | null) => void;
  clearCrypto: () => void;
}

export const createCryptoSlice: StateCreator<CryptoSlice> = (set) => ({
  keyVault: null,
  mySecretKey: null,
  setKeyVault: (vault) => set({ keyVault: vault }),
  setSecretKey: (key) => set({ mySecretKey: key }),
  clearCrypto: () => {
    set({ keyVault: null, mySecretKey: null });
    keyStorage.clear();
  },
});
