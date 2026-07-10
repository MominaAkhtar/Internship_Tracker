import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, CheckCircle, Eye, EyeOff, Search } from 'lucide-react';
import { 
  getNotifications, 
  markAllRead, 
  markRead, 
  deleteNotification 
} from '../services/notifications';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ListSkeleton } from '../components/common/Skeleton';
import { Tracky } from '../components/mascot/Tracky';

export const Notifications = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All'); // 'All', 'Unread', 'Read'

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (err) {
      showToast('Error loading notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleRefresh = () => {
      getNotifications().then(data => setNotifications(data || []));
    };
    window.addEventListener('refresh-notifications-count', handleRefresh);

    return () => {
      window.removeEventListener('refresh-notifications-count', handleRefresh);
    };
  }, []);

  // FIX: compute the filtered list directly during render instead of via
  // useEffect + separate state. The old version needed an extra render
  // pass every time `filter` changed (click -> render with stale list ->
  // effect runs -> render again with correct list), and that lag is what
  // let the card fade animation get caught mid-transition and freeze in
  // a half-opacity "washed out" state, especially when switching tabs
  // quickly. useMemo recalculates in the same render, so there's no gap.
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    // Filter
    if (filter === 'Unread') {
      result = result.filter(n => !n.is_read);
    } else if (filter === 'Read') {
      result = result.filter(n => n.is_read);
    }

    // Search
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(
        n =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
      );
    }

    return result;
  }, [notifications, filter, search]);

  const triggerSidebarUpdate = () => {
    window.dispatchEvent(new CustomEvent('refresh-notifications-count'));
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      showToast('All notifications marked as read', 'success');
      triggerSidebarUpdate();
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      triggerSidebarUpdate();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      showToast('Notification deleted', 'info');
      triggerSidebarUpdate();
    } catch (err) {
      showToast('Failed to delete notification', 'error');
    }
  };

  const getFilterClass = (type) => {
    const isActive = filter === type;
    return `px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
      isActive 
        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10' 
        : 'hover:bg-gray-100 dark:hover:bg-dark-border text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
    }`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Notifications Hub</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Keep track of application deadlines, interviews, and updates.
          </p>
        </div>
        
        {notifications.some(n => !n.is_read) && (
          <Button onClick={handleMarkAllRead} icon={<CheckCircle className="w-4 h-4" />}>
            Mark All Read
          </Button>
        )}
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-5 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-xs">
          <Input
            placeholder="Search notification messages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-gray-400" />}
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <button onClick={() => setFilter('All')} className={getFilterClass('All')}>All</button>
          <button onClick={() => setFilter('Unread')} className={getFilterClass('Unread')}>Unread</button>
          <button onClick={() => setFilter('Read')} className={getFilterClass('Read')}>Read</button>
        </div>
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl">
          <ListSkeleton count={6} />
        </div>
      ) : filteredNotifications.length > 0 ? (
        <motion.div 
          layout
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
             {filteredNotifications.map(n => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all relative overflow-hidden group ${
                  n.is_read
                    ? 'bg-white border-gray-100 text-gray-650 dark:bg-dark-card dark:border-dark-border dark:text-gray-400'
                    : 'bg-primary-50/20 border-primary-100 text-gray-800 dark:bg-primary-950/10 dark:border-primary-900/30 dark:text-gray-250 shadow-xs cursor-pointer hover:bg-primary-50/30 dark:hover:bg-primary-950/15'
                }`}
              >
                {/* Active Indicator Bar */}
                {!n.is_read && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
                )}

                {/* Left icon status */}
                <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                  n.is_read 
                    ? 'bg-gray-100 dark:bg-dark-border text-gray-400' 
                    : 'bg-primary-50 text-primary-500 dark:bg-primary-950/40 dark:text-primary-400'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className={`font-semibold text-sm leading-snug ${
                      n.is_read ? 'text-gray-500 dark:text-gray-400 font-medium' : 'text-gray-900 dark:text-white font-bold'
                    }`}>{n.title}</h3>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed font-normal ${
                    n.is_read ? 'text-gray-500 dark:text-gray-450' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {n.message}
                  </p>
                  
                  {/* Mark Read CTA overlay */}
                  {!n.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(n.id);
                      }}
                      className="text-[10px] text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-bold flex items-center gap-1 mt-2 hover:underline cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Mark as Read
                    </button>
                  )}
                </div>

                {/* Right controls */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(n.id);
                  }}
                  className="text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-dark-border/50 hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-all cursor-pointer flex-shrink-0"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty states */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-12 text-center shadow-lg flex flex-col items-center gap-4 max-w-lg mx-auto"
        >
          <Tracky expression="sleeping" className="w-28 h-28" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold">No notifications to show</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs leading-relaxed mx-auto">
              {search.trim() !== ''
                ? "We couldn't find matching notifications for your search terms."
                : "You are all caught up! There are no active notifications at the moment."
              }
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Notifications;
