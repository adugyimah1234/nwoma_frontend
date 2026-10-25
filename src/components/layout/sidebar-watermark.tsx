import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarWatermarkProps {
  className?: string;
}

/**
 * Subtle embossed shield/crest watermark for the sidebar background (as seen in Image 1).
 */
export function SidebarWatermark({ className }: SidebarWatermarkProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute bottom-24 left-2 right-2 flex justify-center select-none opacity-[0.06] transition-opacity duration-300',
        className
      )}
    >
      <svg
        width="180"
        height="220"
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current text-white fill-transparent"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Shield Outer Outline */}
        <path
          d="M100 20 L170 45 V125 C170 175 100 215 100 215 C100 215 30 175 30 125 V45 Z"
          strokeWidth="3.5"
        />
        {/* Inner Shield Rim */}
        <path
          d="M100 32 L158 53 V123 C158 165 100 200 100 200 C100 200 42 165 42 123 V53 Z"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        {/* Central Book / Shield Division */}
        <path d="M100 40 V190" strokeWidth="2" />
        <path d="M42 110 H158" strokeWidth="2" />
        {/* Academic / Garrison symbols */}
        {/* Open Book in Top Left */}
        <path d="M55 70 C65 65 80 65 90 70 V95 C80 90 65 90 55 95 Z" strokeWidth="2" />
        <path d="M90 70 C80 65 65 65 55 70" strokeWidth="2" />
        {/* Eagle / Wings in Top Right */}
        <path d="M110 75 Q125 60 145 68 Q130 80 120 85 Z" strokeWidth="2" />
        {/* Torch / Sword in Bottom Center */}
        <path d="M100 125 V175" strokeWidth="2.5" />
        <path d="M90 140 H110" strokeWidth="2" />
        {/* Stars */}
        <circle cx="70" cy="150" r="4" fill="currentColor" stroke="none" />
        <circle cx="130" cy="150" r="4" fill="currentColor" stroke="none" />
        {/* Banner ribbon at bottom */}
        <path d="M50 218 C70 210 130 210 150 218 L142 228 C120 222 80 222 58 228 Z" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
