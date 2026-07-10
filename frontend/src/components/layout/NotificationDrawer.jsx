import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCheck, Trash2, Bell } from 'lucide-react';
import {
  getNotifications,
  markAllRead,
  markRead,
  deleteNotification,
} from '../../services/notifications';
import { ListSkeleton } from '../common/Skeleton';
import { Tracky } from '../mascot/Tracky';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications in drawer', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleRefresh = () => {
      if (isOpen) {
        getNotifications().then(data => setNotifications(data || []));
      }
    };
    window.addEventListener('refresh-notifications-count', handleRefresh);
    return () => {
      window.removeEventListener('refresh-notifications-count', handleRefresh);
    };
  }, [isOpen]);

  const triggerCountUpdate = () => {
    // Notify sidebar to refresh count
    window.dispatchEvent(new CustomEvent('refresh-notifications-count'));
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      triggerCountUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      triggerCountUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      triggerCountUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  // FIX #2: close the drawer and only navigate AFTER its exit animation
  // has actually finished, instead of firing both at once. This stops the
  // drawer's closing overlay/blur from fading out at the same time the
  // Notifications page is fading in underneath it (that overlap is what
  // produced the "washed out" look).
  const handleViewAll = () => {
    onClose();
    setTimeout(() => {
      navigate('/notifications');
    }, 300); // matches the drawer's close transition duration below
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        // FIX #1: this was a plain <div> before. AnimatePresence only
        // properly tracks and waits for exit animations on motion
        // components that are its direct child — a plain div gets yanked
        // out immediately instead of fading out cleanly.
        <motion.div
          key="notification-drawer-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 overflow-hidden"
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-xs"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-white dark:bg-dark-card border-l border-gray-100 dark:border-dark-border shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-bold">Notifications</h3>
                </div>
                <div className="flex items-center gap-2">
                  {notifications.some((n) => !n.is_read) && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1 cursor-pointer"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    aria-label="Close panel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {loading && notifications.length === 0 ? (
                  <ListSkeleton count={5} />
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-80 text-center space-y-3">
                    <Tracky expression="sleeping" className="w-28 h-28" />
                    <div>
                      <h4 className="font-bold text-gray-700 dark:text-gray-300">You're all caught up</h4>
                      <p className="text-xs text-gray-400 mt-1">No notifications to display right now.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.is_read && handleMarkRead(n.id)}
                        className={`p-3 rounded-xl border transition-all text-left flex items-start gap-3 relative overflow-hidden group cursor-pointer ${
                          n.is_read
                            ? 'bg-white border-gray-100 text-gray-600 dark:bg-dark-card dark:border-dark-border dark:text-gray-400'
                            : 'bg-primary-50/20 border-primary-100 text-gray-800 dark:bg-primary-950/10 dark:border-primary-900/30 dark:text-gray-200 shadow-xs'
                        }`}
                      >
                        {!n.is_read && (
                          <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
                        )}
                        
                        <div className="flex-grow">
                          <h5 className="font-semibold text-sm leading-snug">{n.title}</h5>
                          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400 leading-normal">{n.message}</p>
                          <span className="text-[10px] text-gray-400 font-medium mt-2 block">
                            {formatTime(n.created_at)}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleDelete(e, n.id)}
                          className="text-gray-300 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* View all page link */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-gray-100 dark:border-dark-border">
                  <button
                    onClick={handleViewAll}
                    className="w-full text-center py-2 text-sm font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
                  >
                    View All Notifications
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDrawer;
