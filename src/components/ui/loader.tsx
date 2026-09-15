import React from "react";

interface LoaderProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  text?: string;
  variant?: "spinner" | "dots" | "pulse" | "bars";
  color?: "indigo" | "blue" | "green" | "red" | "purple" | "gray";
}

const sizeMap = {
  xs: "h-3 w-3",
  sm: "h-4 w-4", 
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-10 w-10",
};

const textSizeMap = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base", 
  xl: "text-lg",
};

const colorMap = {
  indigo: {
    primary: "border-indigo-600",
    secondary: "border-gray-200",
    bg: "bg-indigo-600",
    text: "text-gray-700",
  },
  blue: {
    primary: "border-blue-600",
    secondary: "border-gray-200", 
    bg: "bg-blue-600",
    text: "text-gray-700",
  },
  green: {
    primary: "border-green-600",
    secondary: "border-gray-200",
    bg: "bg-green-600", 
    text: "text-gray-700",
  },
  red: {
    primary: "border-red-600",
    secondary: "border-gray-200",
    bg: "bg-red-600",
    text: "text-gray-700",
  },
  purple: {
    primary: "border-purple-600", 
    secondary: "border-gray-200",
    bg: "bg-purple-600",
    text: "text-gray-700",
  },
  gray: {
    primary: "border-gray-600",
    secondary: "border-gray-200",
    bg: "bg-gray-600",
    text: "text-gray-700",
  },
};

export function Loader({
  className = "",
  size = "md",
  showText = true,
  text = "",
  variant = "spinner",
  color = "indigo",
}: LoaderProps) {
  const sizeClass = sizeMap[size];
  const textSizeClass = textSizeMap[size];
  const colors = colorMap[color];

  const renderSpinner = () => (
    <div className={`${sizeClass} relative`}>
      <div
        className={`absolute inset-0 rounded-full border-2 ${colors.secondary}/30`}
      />
      <div
        className={`absolute inset-0 rounded-full border-2 border-transparent ${colors.primary} border-t-2 animate-spin`}
      />
    </div>
  );

  const renderDots = () => {
    const dotSize = size === 'xs' ? 'h-1.5 w-1.5' : size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-2.5 w-2.5' : size === 'lg' ? 'h-3 w-3' : 'h-3.5 w-3.5';
    
    return (
      <div className="flex space-x-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`rounded-full ${colors.bg} ${dotSize}`}
            style={{
              animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`,
            }}
          />
        ))}
      </div>
    );
  };

  const renderPulse = () => (
    <div className={`${sizeClass} relative`}>
      <div
        className={`absolute inset-0 rounded-full ${colors.bg} animate-ping opacity-40`}
      />
      <div
        className={`relative rounded-full ${colors.bg} ${sizeClass} opacity-75`}
      />
    </div>
  );

  const renderBars = () => {
    const barWidth = size === 'xs' ? 'w-0.5' : size === 'sm' ? 'w-1' : 'w-1.5';
    const heights = ['h-2', 'h-3', 'h-4', 'h-2'];
    
    return (
      <div className="flex items-end space-x-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`${colors.bg} ${barWidth} ${heights[i]} rounded-sm`}
            style={{
              animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    );
  };

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "bars":
        return renderBars();
      default:
        return renderSpinner();
    }
  };

  return (
    <div
      className={`inline-flex items-center ${showText ? 'flex-col space-y-2' : ''} ${className}`}
      role="status"
      aria-label={text}
    >
      {renderLoader()}
      {showText && (
        <span className={`${colors.text} ${textSizeClass} font-medium text-center`}>
          {text}
        </span>
      )}
    </div>
  );
}

// Inline loader for buttons and smaller spaces
export function InlineLoader({
  size = "sm",
  color = "indigo",
  className = "",
}: Pick<LoaderProps, "size" | "color" | "className">) {
  const sizeClass = sizeMap[size];
  const colors = colorMap[color];

  return (
    <div
      className={`${sizeClass} relative inline-block ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div
        className={`absolute inset-0 rounded-full border-2 ${colors.secondary}`}
      />
      <div
        className={`absolute inset-0 rounded-full border-2 border-transparent ${colors.primary} border-t-2 animate-spin`}
      />
    </div>
  );
}

// Full screen loader overlay
export function LoaderOverlay({
  text = "Loading...",
  variant = "spinner",
  color = "indigo",
}: Pick<LoaderProps, "text" | "variant" | "color">) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4 bg-white/60 rounded-xl shadow-lg border border-gray-100 p-8 mx-4">
        <Loader
          size="lg"
          variant={variant}
          color={color}
          text={text}
          showText={true}
          className=""
        />
      </div>
    </div>
  );
}
