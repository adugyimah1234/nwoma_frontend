import React from 'react';
import { cn } from '@/lib/utils';

interface GhanaRibbonProps {
  position?: 'top-right' | 'bottom-left';
  className?: string;
}

export function GhanaRibbonCorner({ position = 'top-right', className }: GhanaRibbonProps) {
  if (position === 'top-right') {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute right-0 top-0 h-16 w-32 select-none overflow-hidden z-10',
          className
        )}
      >
        <svg
          viewBox="0 0 120 70"
          className="h-full w-full"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Red stripe */}
          <polygon points="50,0 80,0 120,40 120,60" fill="#DC2626" opacity="0.95" />
          {/* Middle Gold stripe */}
          <polygon points="70,0 100,0 120,20 120,35 60,0" fill="#F59E0B" opacity="0.95" />
          {/* Primary ribbon set (sweeping across the far corner) */}
          <path d="M40 0L120 70H105L30 0H40Z" fill="#DC2626" />
          <path d="M55 0L120 55V43L68 0H55Z" fill="#F59E0B" />
          <path d="M78 0L120 38V28L88 0H78Z" fill="#00875A" />
          {/* Soft outer glow / highlight */}
          <path d="M28 0L120 73" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  // Bottom-left corner ribbon (as seen in Image 1 sidebar)
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute bottom-16 left-0 h-16 w-36 select-none overflow-hidden z-10',
        className
      )}
    >
      <svg
        viewBox="0 0 140 70"
        className="h-full w-full"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Red stripe */}
        <path d="M0 65L140 0H120L0 55V65Z" fill="#DC2626" />
        {/* Gold stripe */}
        <path d="M0 55L120 0H100L0 45V55Z" fill="#F59E0B" />
        {/* Green stripe */}
        <path d="M0 45L100 0H80L0 35V45Z" fill="#00875A" />
      </svg>
    </div>
  );
}

/**
 * Ghana Flag mini badge / pill with black star for footer & branding
 */
export function GhanaFlagBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center overflow-hidden rounded-xs border border-black/20 shadow-xs shrink-0',
        className
      )}
      style={{ width: 18, height: 12 }}
      title="Republic of Ghana"
    >
      <svg viewBox="0 0 30 20" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="30" height="6.67" fill="#DC2626" />
        <rect y="6.67" width="30" height="6.67" fill="#F59E0B" />
        <rect y="13.33" width="30" height="6.67" fill="#00875A" />
        {/* Black star in the center */}
        <polygon
          points="15,7.5 16.1,10.2 19,10.2 16.6,11.8 17.5,14.5 15,12.8 12.5,14.5 13.4,11.8 11,10.2 13.9,10.2"
          fill="#000000"
        />
      </svg>
    </span>
  );
}
