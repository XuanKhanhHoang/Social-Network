import { useState, useEffect } from 'react';
import { keyStorage } from '@/features/crypto/services/key-storage.service';
import { getSharedKey } from '@/features/crypto/utils/cryptions';
import { ApiClient } from '@/services/api';

interface PublicKeyResponse {
  publicKey: string;
}

export const useChatSession = (receiverId: string | undefined) => {
  const [sharedKey, setSharedKey] = useState<Uint8Array | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!receiverId) {
      setSharedKey(null);
      return;
    }

    const initSession = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Check local storage for shared key
        const existingKey = await keyStorage.getSharedKey(receiverId);
        if (existingKey) {
          setSharedKey(existingKey);
          return;
        }

        // 2. If missing, perform handshake
        // Get my secret key
        const mySecretKey = await keyStorage.getMySecretKey();
        if (!mySecretKey) {
          throw new Error('Secret key not found. Please login again.');
        }

        // Get receiver's public key
        const { publicKey: theirPublicKeyStr } =
          await ApiClient.get<PublicKeyResponse>(
            `/users/${receiverId}/public-key`
          );

        // Derive shared key
        const newSharedKey = getSharedKey(mySecretKey, theirPublicKeyStr);

        // Save shared key
        await keyStorage.saveSharedKey(receiverId, newSharedKey);
        setSharedKey(newSharedKey);
      } catch (err) {
        console.error('Failed to initialize chat session:', err);
        setError('Failed to establish secure connection.');
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [receiverId]);

  return { sharedKey, isLoading, error };
};
