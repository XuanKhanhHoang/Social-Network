import { useEffect, useState } from 'react';
import { decryptFile } from '@/features/crypto/utils/cryptions';
import { Loader2, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DecryptedImageProps {
  url: string;
  nonce: string;
  sharedKey: Uint8Array;
  alt?: string;
  className?: string;
}

export const DecryptedImage = ({
  url,
  nonce,
  sharedKey,
  alt,
  className,
}: DecryptedImageProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let currentObjectUrl: string | null = null;

    const fetchAndDecrypt = async () => {
      try {
        setIsLoading(true);
        setError(false);

        if (url.startsWith('blob:')) {
          setObjectUrl(url);
          setIsLoading(false);
          return;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch image');

        const buffer = await response.arrayBuffer();
        const decryptedBlob = decryptFile(buffer, nonce, sharedKey);

        if (!decryptedBlob) throw new Error('Decryption failed');

        if (active) {
          currentObjectUrl = URL.createObjectURL(decryptedBlob);
          setObjectUrl(currentObjectUrl);
        }
      } catch (err) {
        console.error('Error loading encrypted image:', err);
        if (active) setError(true);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    if (url && nonce && sharedKey) {
      fetchAndDecrypt();
    } else {
      setIsLoading(false);
      setError(true);
    }

    return () => {
      active = false;
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [url, nonce, sharedKey]);

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted/20 rounded-md',
          className
        )}
      >
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !objectUrl) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted/20 rounded-md',
          className
        )}
      >
        <ImageOff className="w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={objectUrl}
      alt={alt || 'Encrypted content'}
      className={className}
    />
  );
};
