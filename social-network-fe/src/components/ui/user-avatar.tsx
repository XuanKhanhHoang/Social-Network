'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
  size?: number;
}

export function UserAvatar({
  src,
  name,
  className,
  size = 48,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Avatar
      className={cn(
        'relative aspect-square flex-shrink-0 overflow-hidden rounded-full bg-gray-100 border border-gray-100',
        className
      )}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={name || 'User avatar'}
          fill
          sizes={`${size}px`}
          className="h-full w-full object-cover object-center"
          priority={false} // Lazy load mặc định
          onError={() => setImageError(true)}
        />
      ) : (
        <AvatarFallback className="flex h-full w-full items-center justify-center bg-gray-100 font-medium text-gray-500 text-sm">
          {name ? name[0].toUpperCase() : '?'}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
