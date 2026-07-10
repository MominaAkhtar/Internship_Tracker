import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Tracky } from '../components/mascot/Tracky';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { PasswordValidationRules } from '../components/common/PasswordValidationRules';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
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

export const Register = () => {
  const { registerUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const watchPassword = watch('password', '');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await registerUser(data.name, data.email, data.password);
      showToast('Registration successful! Welcome to OnTrack!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Email already registered or signup error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-bg px-4 relative overflow-hidden py-12">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/20 dark:bg-primary-900/10 rounded-full filter blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-200/20 dark:bg-secondary-900/10 rounded-full filter blur-3xl -z-10" />

      {/* Centered Logo with peeking Tracky */}
      <div className="relative mb-6 text-center select-none flex flex-col items-center">
        {/* Peeking Tracky behind logo */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-0"
        >
          <Tracky expression="excited" className="w-16 h-16" />
        </motion.div>

        <div className="z-10 relative mt-4">
          <h1 className="font-display font-black text-4xl bg-gradient-to-r from-primary-600 to-accent-blue bg-clip-text text-transparent dark:from-white dark:to-primary-300">
            OnTrack
          </h1>
          <p className="text-xs font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mt-1">
            Track your internship journey effortlessly.
          </p>
        </div>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md bg-white/90 dark:bg-dark-card/90 backdrop-blur-md border border-gray-100 dark:border-dark-border shadow-2xl rounded-3xl p-8 relative overflow-hidden"
      >
        <h2 className="text-2xl font-bold text-left mb-5">Create Account</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
          <Input
            label="Full Name"
            name="name"
            placeholder="John Doe"
            error={errors.name}
            {...register('name')}
            icon={<User className="w-4 h-4 text-gray-400" />}
          />

          <Input
            label="Email Address"
            name="email"
            placeholder="john@student.edu"
            error={errors.email}
            {...register('email')}
            icon={<Mail className="w-4 h-4 text-gray-400" />}
          />

          <div className="space-y-1">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              error={errors.password}
              {...register('password')}
              icon={<Lock className="w-4 h-4 text-gray-400" />}
            />
            <PasswordValidationRules password={watchPassword} />
          </div>

          <Input
            label="Confirm Password"
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
            icon={submitting ? <Tracky expression="loading" className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          >
            {submitting ? 'Registering...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400 relative z-10">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            Sign In
          </Link>
        </div>

        {/* Mascot background watermark */}
        <motion.div
          animate={{
            y: [0, -3, 0],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-4 -right-4 w-20 h-20 opacity-20 pointer-events-none select-none"
        >
          <Tracky expression="excited" className="w-full h-full" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
