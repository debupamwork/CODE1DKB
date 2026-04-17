import React from 'react';

interface CustomBagIconProps {
  className?: string;
  fillOpacity?: number;
  isFilled?: boolean;
  strokeWidth?: number | string;
}

export default function CustomBagIcon({ 
  className = "w-5 h-5", 
  fillOpacity = 0.3, 
  isFilled = false,
  strokeWidth = "1.5"
}: CustomBagIconProps) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth}
      className={className}
    >
      <path d="M6 8V7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7V8" />
      <path 
        d="M3 8H21V21C21 22.1046 20.1046 23 19 23H5C3.89543 23 3 22.1046 3 21V8Z" 
        fill={isFilled ? "currentColor" : "none"}
        fillOpacity={fillOpacity}
      />
    </svg>
  );
}
