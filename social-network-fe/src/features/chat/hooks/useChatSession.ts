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
        const existingKey = await keyStorage.getSharedKey(receiverId);
        if (existingKey) {
          setSharedKey(existingKey);
          return;
        }

        const mySecretKey = await keyStorage.getMySecretKey();
        if (!mySecretKey) {
          throw new Error('Secret key not found. Please login again.');
        }
        const { publicKey: theirPublicKeyStr } =
          await ApiClient.get<PublicKeyResponse>(
            `/users/${receiverId}/public-key`
          );

        const newSharedKey = getSharedKey(mySecretKey, theirPublicKeyStr);

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
