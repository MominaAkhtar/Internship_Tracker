import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-bg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none';

  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-md shadow-primary-500/10 hover:shadow-lg hover:shadow-primary-500/20 dark:shadow-none',
    secondary: 'bg-secondary-200 hover:bg-secondary-300 text-primary-900 active:bg-secondary-400',
    outline: 'border border-gray-300 dark:border-dark-border bg-transparent text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-dark-card',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-card',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/10 dark:shadow-none',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
};

export default Button;
