'use client';
import { useEffect, useState } from 'react';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsInitialized(true), 1000);
  }, []);

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <img src="/logo.png" alt="logo" className="w-20 h-20" />
      </div>
    );
  }

  return <>{children}</>;
}
