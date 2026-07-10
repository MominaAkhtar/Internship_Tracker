import React from 'react';

export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const baseStyles = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border select-none';

  const variants = {
    primary: 'bg-primary-50 text-primary-700 border-primary-100 dark:bg-primary-950/20 dark:text-primary-400 dark:border-primary-900/30',
    secondary: 'bg-secondary-50 text-secondary-600 border-secondary-100 dark:bg-secondary-950/20 dark:text-secondary-400 dark:border-secondary-900/30',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
    warning: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
    danger: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
    neutral: 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700/50',
  };

  const getStatusVariant = (statusName) => {
    switch (String(statusName).toLowerCase()) {
      case 'applied':
      case 'application_added':
        return 'primary';
      case 'interview':
      case 'interview_scheduled':
      case 'interview_reminder':
        return 'warning';
      case 'offer':
      case 'offer_received':
        return 'success';
      case 'rejected':
      case 'rejection_received':
        return 'danger';
      case 'deadline_reminder':
      case 'application_updated':
      case 'status_changed':
        return 'secondary';
      default:
        return 'neutral';
    }
  };

  const chosenVariant = variants[variant] ? variant : getStatusVariant(variant);

  return (
    <span className={`${baseStyles} ${variants[chosenVariant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
