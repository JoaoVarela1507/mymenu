import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ 
  label, 
  error, 
  className = '',
  ...props 
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-dark">
          {label}
        </label>
      )}
      <input
        className={`
          bg-white border-2 border-dark/20 rounded-lg px-4 py-3 text-base
          focus:border-primary focus:outline-none
          disabled:bg-secondary/50 disabled:cursor-not-allowed
          ${error ? 'border-status-cancelado' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-sm text-status-cancelado">
          {error}
        </span>
      )}
    </div>
  );
}
