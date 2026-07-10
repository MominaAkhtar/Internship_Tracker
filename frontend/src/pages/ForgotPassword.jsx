import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { KeyRound, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Tracky } from '../components/mascot/Tracky';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

export const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [devToken, setDevToken] = useState('');
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await forgotPassword(data.email);
      showToast('Password reset link generated!', 'success');
      setSent(true);
      if (res && res.token) {
        // Expose token for local developer testing
        setDevToken(res.token);
      }
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to request password reset', 'error');
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

        {!sent ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-left leading-relaxed">
              Enter your email address and we'll generate a secure reset link. 
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
                {submitting ? 'Generating link...' : 'Generate Reset Link'}
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-6 text-left">
            <div className="p-5 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-900/20 rounded-2xl flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
              <div className="text-sm text-emerald-800 dark:text-emerald-400 leading-relaxed font-semibold">
                Check your inbox! We have sent a secure password reset link to your email address if it is registered on OnTrack.
              </div>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              If you do not receive the email within a few minutes, please check your spam folder or request a new reset link.
            </p>

            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border/40 transition-colors text-center cursor-pointer"
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
