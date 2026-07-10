import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { Tracky } from '../components/mascot/Tracky';
import { Button } from '../components/common/Button';

export const ErrorPage = ({ code = 404 }) => {
  const navigate = useNavigate();

  const getErrorContent = () => {
    switch (code) {
      case 401:
        return {
          title: 'Access Denied',
          subtitle: 'Unauthorized Area',
          description: 'Oops! You need to be signed in to access this page or your session has expired.',
          expression: 'sad',
          actions: (
            <Button onClick={() => navigate('/login')} icon={<ArrowLeft className="w-4 h-4" />}>
              Sign In
            </Button>
          ),
        };
      case 500:
        return {
          title: 'System Error',
          subtitle: 'Internal Server Error',
          description: "Oh no! Tracky tripped over some wires. We're having issues connecting to the server.",
          expression: 'sad',
          actions: (
            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()} variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
                Retry
              </Button>
              <Button onClick={() => navigate('/dashboard')} icon={<Home className="w-4 h-4" />}>
                Go Home
              </Button>
            </div>
          ),
        };
      case 404:
      default:
        return {
          title: 'Page Not Found',
          subtitle: 'Lost in Space',
          description: "Sorry! The page you are looking for doesn't exist or has been relocated.",
          expression: 'confused',
          actions: (
            <Button onClick={() => navigate(-1)} icon={<ArrowLeft className="w-4 h-4" />}>
              Go Back
            </Button>
          ),
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-bg px-4 relative overflow-hidden py-12">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-300/10 dark:bg-primary-900/5 rounded-full filter blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-md text-center flex flex-col items-center"
      >
        <motion.div
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: 'easeInOut',
          }}
          className="mb-8"
        >
          <Tracky expression={content.expression} className="w-36 h-36" />
        </motion.div>

        <h1 className="font-display font-black text-7xl text-gray-300 dark:text-gray-800 tracking-wider">
          {code}
        </h1>
        
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
          {content.title}
        </h2>
        
        <p className="text-xs uppercase tracking-widest font-black text-secondary-500 mt-1">
          {content.subtitle}
        </p>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 mb-8 max-w-xs leading-relaxed">
          {content.description}
        </p>

        <div className="flex items-center justify-center">
          {content.actions}
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
