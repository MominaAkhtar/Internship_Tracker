import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Tracky } from '../components/mascot/Tracky';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const token = searchParams.get('token');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!token) {
      showToast('Invalid or missing password reset token', 'error');
      navigate('/login');
    }
  }, [token, navigate, showToast]);

  const onSubmit = async (data) => {
    if (!token) return;
    setSubmitting(true);
    try {
      await resetPassword(token, data.password);
      showToast('Password updated successfully! Please log in with your new password.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to reset password. The link may have expired.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-bg px-4 relative overflow-hidden py-12">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/20 dark:bg-primary-900/10 rounded-full filter blur-3xl -z-10" />

      {/* Centered Logo */}
      <div className="relative mb-6 text-center select-none flex flex-col items-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-0"
        >
          <Tracky expression="excited" className="w-16 h-16" />
        </motion.div>
        <div className="z-10 relative mt-4">
          <h1 className="font-display font-black text-4xl bg-gradient-to-r from-primary-600 to-accent-blue bg-clip-text text-transparent dark:from-white dark:to-primary-300">
            OnTrack
          </h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/90 dark:bg-dark-card/90 backdrop-blur-md border border-gray-100 dark:border-dark-border shadow-2xl rounded-3xl p-8 relative overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-4">
          <Link
            to="/login"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            aria-label="Back to Login"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h2 className="text-2xl font-bold">New Password</h2>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-left leading-relaxed">
          Create a secure new password for your OnTrack account.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="New Password"
            name="password"
            type="password"
            placeholder="••••••••"
            error={errors.password}
            {...register('password')}
            icon={<Lock className="w-4 h-4 text-gray-400" />}
          />

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword}
            {...register('confirmPassword')}
            icon={<Lock className="w-4 h-4 text-gray-400" />}
          />

          <Button
            type="submit"
            disabled={submitting}
            className="w-full py-3 mt-2"
            icon={submitting ? <Tracky expression="loading" className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          >
            {submitting ? 'Updating password...' : 'Update Password'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
