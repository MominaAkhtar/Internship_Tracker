import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { KeyRound, Mail, ArrowLeft, ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Tracky } from '../components/mascot/Tracky';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { PasswordValidationRules } from '../components/common/PasswordValidationRules';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

const resetSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const ForgotPassword = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    watch: watchReset,
    reset: resetResetForm,
    formState: { errors: resetErrors },
  } = useForm({ resolver: zodResolver(resetSchema) });

  const watchPassword = watchReset('password', '');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await forgotPassword(data.email);
      if (res && res.token) {
        setResetToken(res.token);
        setShowResetModal(true);
      } else {
        showToast('Could not start password reset. Please try again.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to request password reset', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetToken('');
    resetResetForm();
  };

  const onResetSubmit = async (data) => {
    if (!resetToken) return;
    setResetSubmitting(true);
    try {
      await resetPassword(resetToken, data.password);
      showToast('Password updated successfully! Please log in with your new password.', 'success');
      closeResetModal();
      navigate('/login');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to reset password. Please try again.', 'error');
    } finally {
      setResetSubmitting(false);
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
          <Tracky expression="thinking" className="w-16 h-16" />
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
          <h2 className="text-2xl font-bold">Reset Password</h2>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-left leading-relaxed">
          Enter your email address to verify your account, then reset your password right here.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            name="email"
            placeholder="you@student.edu"
            error={errors.email}
            {...register('email')}
            icon={<Mail className="w-4 h-4 text-gray-400" />}
          />

          <Button
            type="submit"
            disabled={submitting}
            className="w-full py-3 mt-2"
            icon={submitting ? <Tracky expression="loading" className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
          >
            {submitting ? 'Verifying...' : 'Continue'}
          </Button>
        </form>
      </motion.div>

      <Modal
        isOpen={showResetModal}
        onClose={closeResetModal}
        title="Set a New Password"
        closeOnOverlayClick={false}
      >
        <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Input
              label="New Password"
              name="password"
              type="password"
              placeholder="••••••••"
              error={resetErrors.password}
              {...registerReset('password')}
              icon={<Lock className="w-4 h-4 text-gray-400" />}
            />
            <PasswordValidationRules password={watchPassword} />
          </div>

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            error={resetErrors.confirmPassword}
            {...registerReset('confirmPassword')}
            icon={<Lock className="w-4 h-4 text-gray-400" />}
          />

          <Button
            type="submit"
            disabled={resetSubmitting}
            className="w-full py-3 mt-2"
            icon={resetSubmitting ? <Tracky expression="loading" className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          >
            {resetSubmitting ? 'Updating password...' : 'Update Password'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ForgotPassword;