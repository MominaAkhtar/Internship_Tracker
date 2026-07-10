import React from 'react';
import { Check, X } from 'lucide-react';

export const PasswordValidationRules = ({ password = '' }) => {
  const rules = [
    { label: 'Minimum 8 characters', met: password.length >= 8 },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'At least one lowercase letter', met: /[a-z]/.test(password) },
    { label: 'At least one number', met: /[0-9]/.test(password) },
    { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="p-4 bg-gray-50 dark:bg-dark-border/20 rounded-2xl border border-gray-100 dark:border-dark-border mt-2 space-y-2 text-left">
      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1 select-none">
        Password Requirements
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs font-semibold select-none">
            <span className={`p-0.5 rounded-full transition-all duration-200 ${
              rule.met 
                ? 'bg-emerald-500/10 text-emerald-500 scale-110' 
                : 'bg-gray-200 dark:bg-dark-border text-gray-400'
            }`}>
              {rule.met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            </span>
            <span className={`transition-all duration-200 ${
              rule.met 
                ? 'text-emerald-600 dark:text-emerald-400 opacity-75 font-bold' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordValidationRules;
