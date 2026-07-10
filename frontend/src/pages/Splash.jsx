import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tracky } from '../components/mascot/Tracky';
import { useAuth } from '../context/AuthContext';

export const Splash = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar manually
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100 && !loading) {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [progress, loading, user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-gray-200">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-6">
        {/* Waving Mascot */}
        <Tracky expression="waving" className="w-32 h-32" />

        {/* Brand details */}
        <div className="text-center space-y-2">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-display font-black tracking-tight bg-gradient-to-r from-primary-600 to-accent-blue bg-clip-text text-transparent dark:from-white dark:to-primary-300"
          >
            OnTrack
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-sm font-semibold text-gray-400 dark:text-gray-500"
          >
            Track your internship journey effortlessly.
          </motion.p>
        </div>

        {/* Custom Progress bar */}
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-4">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-blue"
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeInOut' }}
          />
        </div>
        
        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-600 animate-pulse mt-1">
          Loading Assistant...
        </span>
      </div>
    </div>
  );
};

export default Splash;
