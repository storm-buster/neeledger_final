import { ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

const badgeStyles = tv({
  base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors shadow-sm',
  variants: {
    variant: {
      default: 'bg-nee-100 dark:bg-nee-900/30 text-nee-800 dark:text-nee-300',
      secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      success: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
      warning: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
      danger: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
      outline: 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-transparent',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps extends VariantProps<typeof badgeStyles> {
  children: ReactNode;
  className?: string;
}

export const Badge = ({ children, variant, className }: BadgeProps) => {
  return <span className={badgeStyles({ variant, className })}>{children}</span>;
};
