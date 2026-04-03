import { Input as AriaInput, TextField, Label, type TextFieldProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { forwardRef } from 'react';

const inputStyles = tv({
  base: 'w-full rounded-lg border bg-white/90 dark:bg-gray-800/80 px-4 py-2 text-sm transition-all placeholder:text-gray-400 focus:border-nee-500 focus:outline-none focus:ring-2 focus:ring-nee-500/30 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm backdrop-blur-sm',
});

export interface InputProps extends Omit<TextFieldProps, 'children'> {
  label?: string;
  placeholder?: string;
  className?: string;
  type?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, placeholder, className, type = 'text', ...props }, ref) => {
    return (
      <TextField {...props}>
        {label && <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</Label>}
        <AriaInput
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={inputStyles({ className })}
        />
      </TextField>
    );
  }
);

Input.displayName = 'Input';
