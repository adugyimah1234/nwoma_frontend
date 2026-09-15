import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Spinner component variants
 */
const spinnerVariants = cva(
  "inline-block animate-spin text-muted-foreground/50",
  {
    variants: {
      variant: {
        default: "text-muted-foreground/50",
        primary: "text-primary",
        secondary: "text-secondary",
        destructive: "text-destructive",
        success: "text-green-500",
        warning: "text-yellow-500",
        info: "text-blue-500",
      },
      size: {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-6 w-6",
        xl: "h-8 w-8",
        "2xl": "h-12 w-12",
      },
      animation: {
        spin: "animate-spin",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      animation: "spin",
    },
  }
);

/**
 * Spinner component props
 */
export interface SpinnerProps
  extends React.HTMLAttributes<SVGElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Whether to show the spinner
   * @default true
   */
  loading?: boolean;
  
  /**
   * The label for screen readers
   * @default "Loading"
   */
  label?: string;
  
  /**
   * Whether to use solid fill instead of stroke
   * @default false
   */
  solid?: boolean;
}

/**
 * Spinner component for loading indicators
 * 
 * @example
 * <Spinner />
 * <Spinner variant="primary" size="lg" />
 * <Spinner variant="destructive" solid />
 */
export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      loading = true,
      label = "Loading",
      solid = false,
      ...props
    },
    ref
  ) => {
    if (!loading) return null;

    const ariaLabel = props["aria-label"] || label;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        aria-label={ariaLabel}
        role="status"
        ref={ref}
        className={cn(spinnerVariants({ variant, size, animation }), className)}
        {...props}
      >
        {solid ? (
          // Solid variant uses circles with different opacities
          <>
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              fill="currentColor"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </>
        ) : (
          // Standard variant uses a stroke
          <>
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </>
        )}
      </svg>
    );
  }
);

Spinner.displayName = "Spinner";

/**
 * Button spinner that shows a spinner inside a button while preserving the button's width
 */
export interface ButtonSpinnerProps extends SpinnerProps {
  /**
   * Text to show next to the spinner
   */
  text?: string;
}

/**
 * ButtonSpinner component for use inside buttons
 * 
 * @example
 * <Button disabled={isLoading}>
 *   <ButtonSpinner loading={isLoading} />
 *   Save Changes
 * </Button>
 */
export const ButtonSpinner = React.forwardRef<SVGSVGElement, ButtonSpinnerProps>(
  ({ className, size = "sm", text, ...props }, ref) => {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Spinner
          ref={ref}
          size={size}
          className={className}
          {...props}
        />
        {text && <span>{text}</span>}
      </span>
    );
  }
);

ButtonSpinner.displayName = "ButtonSpinner";


