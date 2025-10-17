'use client';

import React from 'react';

type SvgIconProps = {
  IconComponent: React.ElementType;
  width?: number;
  height?: number;
  className?: string;
  [key: string]: unknown;
};

function SvgIcon({
  IconComponent,
  width = 24,
  height = 24,
  className,
  ...rest
}: SvgIconProps) {
  return (
    <IconComponent
      width={width}
      height={height}
      className={className}
      {...rest}
    />
  );
}

export default React.memo(SvgIcon);
