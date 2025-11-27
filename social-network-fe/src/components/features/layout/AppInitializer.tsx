'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsInitialized(true), 1000);
  }, []);

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Image src="/logo.png" alt="logo" width={100} height={100} />
      </div>
    );
  }

  return <>{children}</>;
}
