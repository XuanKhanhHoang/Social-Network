// components/media/common/MediaGrid.tsx
'use client';

import React from 'react';

type MediaGridProps<T> = {
  media: T[];
  renderItem: (item: T, index: number, className: string) => React.ReactNode;
};

export function MediaGrid<T>({ media, renderItem }: MediaGridProps<T>) {
  if (!media || media.length === 0) return null;

  const displayMedia = media.slice(0, 6);
  const remainingCount = Math.max(0, media.length - 6);

  switch (media.length) {
    case 1:
      return (
        <div className=" rounded-xs">{renderItem(media[0], 0, 'w-full')}</div>
      );

    case 2:
      return (
        <div className="grid grid-cols-2 gap-0.5  rounded-xs">
          {displayMedia.map((item, index) => (
            <div key={index} className="w-full aspect-square">
              {renderItem(item, index, 'w-full h-full')}
            </div>
          ))}
        </div>
      );

    case 3:
      return (
        <div className="grid grid-cols-5 gap-0.5  rounded-xs aspect-[4/3]">
          <div className="col-span-3">
            {renderItem(displayMedia[0], 0, 'w-full h-full')}
          </div>
          <div className="col-span-2 grid grid-rows-2 gap-0.5">
            {renderItem(displayMedia[1], 1, 'w-full h-full')}
            {renderItem(displayMedia[2], 2, 'w-full h-full')}
          </div>
        </div>
      );

    case 4:
      return (
        <div className="grid grid-cols-2 gap-0.5  rounded-xs">
          {displayMedia.map((item, index) => (
            <div key={index} className="w-full aspect-square">
              {renderItem(item, index, 'w-full h-full')}
            </div>
          ))}
        </div>
      );

    case 5:
      return (
        <div className=" rounded-xs aspect-[3/2]">
          <div className="grid grid-cols-8 gap-0.5 h-full">
            <div className="col-span-3">
              {renderItem(displayMedia[0], 0, 'w-full h-full')}
            </div>
            <div className="col-span-3">
              {renderItem(displayMedia[1], 1, 'w-full h-full')}
            </div>
            <div className="col-span-2 grid grid-rows-3 gap-0.5">
              {renderItem(displayMedia[2], 2, 'w-full h-full')}
              {renderItem(displayMedia[3], 3, 'w-full h-full')}
              {renderItem(displayMedia[4], 4, 'w-full h-full')}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className=" rounded-xs">
          <div className="grid grid-cols-3 gap-0.5">
            {displayMedia.slice(0, 5).map((item, index) => (
              <div key={index} className="w-full aspect-square">
                {renderItem(item, index, 'w-full h-full')}
              </div>
            ))}
            <div className="relative w-full aspect-square">
              {renderItem(displayMedia[5], 5, 'w-full h-full')}
              {remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer">
                  <span className="text-white font-semibold text-xl">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
  }
}
