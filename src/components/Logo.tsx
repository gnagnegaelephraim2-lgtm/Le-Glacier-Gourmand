import React from 'react';
import { img } from '../utils/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "h-12", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <img 
        src={img('https://i.ibb.co/TxwrGGRh/Logo.png', 200)}
        alt="Le Glacier Gourmand Logo"
        className="h-full w-auto object-contain brightness-0 invert"
      />
      {showText && (
        <div className="flex flex-col -space-y-1">
          <span className="font-serif font-bold leading-tight tracking-tight text-2xl sm:text-3xl">
            Le Glacier
          </span>
          <span className="font-serif font-bold leading-tight tracking-tight text-2xl sm:text-3xl">
            Gourmand
          </span>
        </div>
      )}
    </div>
  );
}
