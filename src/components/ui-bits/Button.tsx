import { Button as AriaButton, ButtonProps as AriaButtonProps } from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants';
import { forwardRef } from 'react';

// Enhanced visual style (glass + soft shadow) while keeping API unchanged
const buttonStyles = tv({
  base: 'inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none touch-manipulation backdrop-blur-sm',
  variants: {
    variant: {
      primary: 'bg-gradient-to-br from-nee-500 to-nee-600 text-white shadow-md hover:from-nee-600 hover:to-nee-700',
      secondary: 'bg-white/80 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 border border-gray-200/60 dark:border-gray-700/60',
      outline: 'border-2 border-nee-600 text-nee-600 bg-transparent hover:bg-nee-50',
      ghost: 'bg-transparent text-gray-700 hover:bg-white/5',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    },
    size: {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-2.5 text-base min-h-[40px]',
      lg: 'px-6 py-3 text-lg min-h-[44px]',
    },
    subtle: {
      true: 'opacity-90 hover:opacity-100',
    }
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export interface ButtonProps extends AriaButtonProps, VariantProps<typeof buttonStyles> {
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, subtle, className, ...props }, ref) => {
    return (
      <AriaButton
        ref={ref}
        className={buttonStyles({ variant, size, subtle, className })}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
