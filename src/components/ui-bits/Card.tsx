import { ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

const cardStyles = tv({
  slots: {
    base: 'rounded-2xl border bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-lg transition-all border-gray-200/60 dark:border-gray-700/60',
    header: 'flex flex-col space-y-1.5 p-5 sm:p-6',
    title: 'text-lg sm:text-xl font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100',
    description: 'text-sm text-gray-600 dark:text-gray-400',
    content: 'p-4 sm:p-6 pt-0',
    footer: 'flex items-center p-4 sm:p-6 pt-0',
  },
  variants: {
    hover: {
      true: {
        base: 'hover:shadow-2xl hover:scale-[1.01] cursor-pointer',
      },
    },
    elevation: {
      low: { base: 'shadow-sm' },
      medium: { base: 'shadow-md' },
      high: { base: 'shadow-2xl' },
    },
  },
});

const { base, header, title, description, content, footer } = cardStyles();

export interface CardProps extends VariantProps<typeof cardStyles> {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, hover, className }: CardProps) => {
  return <div className={base({ hover, className })}>{children}</div>;
};

export const CardHeader = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <div className={header({ className })}>{children}</div>;
};

export const CardTitle = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <h3 className={title({ className })}>{children}</h3>;
};

export const CardDescription = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <p className={description({ className })}>{children}</p>;
};

export const CardContent = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <div className={content({ className })}>{children}</div>;
};

export const CardFooter = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <div className={footer({ className })}>{children}</div>;
};
