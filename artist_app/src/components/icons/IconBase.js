import React from 'react';
import Svg from 'react-native-svg';

export default function IconBase({
  size = 24,
  width,
  height,
  color = '#000000',
  viewBox = '0 0 24 24',
  style,
  children,
  ...props
}) {
  const iconWidth = width || size;
  const iconHeight = height || size;

  return (
    <Svg
      width={iconWidth}
      height={iconHeight}
      viewBox={viewBox}
      fill="none"
      style={style}
      {...props}
    >
      {typeof children === 'function' ? children({ color, size: iconWidth }) : children}
    </Svg>
  );
}
