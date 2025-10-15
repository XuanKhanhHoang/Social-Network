'use client';

import Image from 'next/image';
import React from 'react';

type SvgIconProps = {
  src: string;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
};
function SvgIcon({
  src,
  width = 24,
  height = 24,
  fill,
  stroke,
  className,
  style,
  alt,
}: SvgIconProps) {
  return (
    <Image
      src={src}
      width={width}
      height={height}
      className={className}
      style={{
        display: 'inline-block',
        objectFit: 'contain',
        backgroundColor: fill,
        WebkitMaskImage: `url(${src})`,
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
        maskImage: `url(${src})`,
        maskRepeat: 'no-repeat',
        maskSize: 'contain',
        ...style,
      }}
      alt="svg-icon"
    />
  );
}
export default React.memo(SvgIcon);
