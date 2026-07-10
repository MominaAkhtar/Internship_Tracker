import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Bell, 
  Lock, 
  Check, 
  Eye, 
  Mail,
  Shield,
  Smartphone
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Tracky } from '../components/mascot/Tracky';

export const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, forgotPassword } = useAuth();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notif_preferences');
    return saved ? JSON.parse(saved) : {
      emailAlerts: true,
      desktopAlerts: false,
      soundAlerts: true,
      deadlineReminders: true
    };
  });

  const [requestingReset, setRequestingReset] = useState(false);

  useEffect(() => {
    localStorage.setItem('notif_preferences', JSON.stringify(notifications));
  }, [notifications]);

  const handleToggleNotif = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    showToast('Preferences updated locally!', 'success');
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setRequestingReset(true);
    try {
      await forgotPassword(user.email);
      showToast('A password reset link has been dispatched to your email!', 'success');
    } catch (err) {
      showToast('Unable to dispatch reset link', 'error');
    } finally {
      setRequestingReset(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-left">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black">System Settings</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Personalise your workspace layout, alerts, and security credentials.
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-500/10 text-primary-500 dark:text-primary-400 rounded-xl">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base">Appearance Theme</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Switch between complete Light and Dark modes.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-primary-500 bg-primary-50/10 text-primary-600 dark:text-primary-400'
                  : 'border-gray-100 dark:border-dark-border text-gray-500'
              }`}
            >
              <Sun className="w-5 h-5" />
              <div className="space-y-0.5">
                <span className="text-sm font-bold block">Light Theme</span>
                <span className="text-[10px] text-gray-400">Bright workspace layout</span>
              </div>
            </button>

            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-primary-500 bg-primary-950/20 text-white'
                  : 'border-gray-100 dark:border-dark-border text-gray-500'
              }`}
            >
              <Moon className="w-5 h-5" />
              <div className="space-y-0.5">
                <span className="text-sm font-bold block">Dark Theme</span>
                <span className="text-[10px] text-gray-400">Sleek dark aesthetics</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Notifications Preference Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-500/10 text-primary-500 dark:text-primary-400 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Alert Preferences</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Configure how you would like to receive tracker reminders.</p>
            </div>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-dark-border space-y-4">
            {/* Preference Row 1 */}
            <div className="flex items-center justify-between pb-4">
              <div className="space-y-0.5 pr-4">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">Email Reminders</h4>
                <p className="text-xs text-gray-400">Send upcoming interview reminders directly to {user?.email}.</p>
              </div>
              <button
                onClick={() => handleToggleNotif('emailAlerts')}
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                  notifications.emailAlerts ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                  notifications.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Preference Row 2 */}
            <div className="flex items-center justify-between py-4">
              <div className="space-y-0.5 pr-4">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">Desktop Push Notifications</h4>
                <p className="text-xs text-gray-400">Receive persistent notifications in the browser window.</p>
              </div>
              <button
                onClick={() => handleToggleNotif('desktopAlerts')}
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                  notifications.desktopAlerts ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                  notifications.desktopAlerts ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Preference Row 3 */}
            <div className="flex items-center justify-between py-4">
              <div className="space-y-0.5 pr-4">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">Audio Alerts</h4>
                <p className="text-xs text-gray-400">Play micro-sounds when notifications or events trigger.</p>
              </div>
              <button
                onClick={() => handleToggleNotif('soundAlerts')}
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                  notifications.soundAlerts ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                  notifications.soundAlerts ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Security Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-500/10 text-primary-500 dark:text-primary-400 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Security & Password</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Update your access password and security clearances.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 bg-gray-50 dark:bg-dark-border/20 p-5 rounded-2xl border border-gray-100/50 dark:border-dark-border justify-between">
            <div className="space-y-1 text-left w-full sm:w-auto">
              <h4 className="text-sm font-bold">Request Password Reset Link</h4>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                For security reasons, we generate password updates via email verification. Click below to request a secure link.
              </p>
            </div>
            <Button
              onClick={handlePasswordReset}
              disabled={requestingReset}
              variant="outline"
              size="sm"
              icon={requestingReset ? <Tracky expression="loading" className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            >
              {requestingReset ? 'Sending...' : 'Reset Password'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
