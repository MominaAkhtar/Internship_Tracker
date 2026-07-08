import React from 'react';

export const Input = React.forwardRef(({
  label,
  name,
  type = 'text',
  error,
  placeholder,
  className = '',
  required = false,
  helperText,
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full text-left ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
        className={`w-full px-4 py-2.5 rounded-xl border font-medium text-sm transition-all focus:outline-none focus:ring-2 
          ${error 
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/10' 
            : 'border-gray-200 dark:border-dark-border focus:border-primary-500 focus:ring-primary-500/20 bg-white dark:bg-dark-card dark:text-white'
          }
          placeholder-gray-400 dark:placeholder-gray-500`}
        {...props}
      />

      {error && (
        <span
          id={`${name}-error`}
          className="text-xs font-semibold text-rose-500"
          role="alert"
        >
          {error.message || error}
        </span>
      )}

      {!error && helperText && (
        <span
          id={`${name}-helper`}
          className="text-xs text-gray-400 dark:text-gray-500"
        >
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
