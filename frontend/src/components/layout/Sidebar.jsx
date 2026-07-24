import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  History,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getNotificationCount } from '../../services/notifications';
import { API_BASE_URL } from '../../api/config';

export const Sidebar = ({ isCollapsed, setIsCollapsed, onOpenNotificationsDrawer }) => {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      if (!user) return;
      try {
        const res = await getNotificationCount();
        // Backend returns raw count dict or integer
        if (res && typeof res === 'object') {
          setUnreadCount(res.unread !== undefined ? res.unread : (res.count || 0));
        } else if (typeof res === 'number') {
          setUnreadCount(res);
        }
      } catch (err) {
        console.error('Failed to fetch notification count in sidebar', err);
      }
    };

    fetchCount();
    
    // Refresh count every 45s
    const interval = setInterval(fetchCount, 45000);
    
    // Listen for custom notifications read/updated events
    const handleRefresh = () => fetchCount();
    window.addEventListener('refresh-notifications-count', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refresh-notifications-count', handleRefresh);
    };
  }, [user]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Applications', path: '/applications', icon: Briefcase },
    { name: 'Insights', path: '/insights', icon: BarChart3 },
    { name: 'Activity Logs', path: '/activity', icon: History },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
      onClickAction: (e) => {
        // Optional: on mobile/tablet or for quick view, trigger drawer instead
        // But the user requested BOTH a drawer (bell click) and page navigation.
        // So clicking this NavLink goes to the full page, whereas the top Bell icon triggers the drawer.
      }
    },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 76 : 260 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col h-screen sticky top-0 bg-white dark:bg-dark-card border-r border-gray-100 dark:border-dark-border text-gray-700 dark:text-gray-300 select-none z-30"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-dark-border min-h-[65px]">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-blue flex items-center justify-center text-white font-black text-lg shadow-md shadow-primary-500/10">
                O
              </div>
              <span className="font-display font-black text-xl bg-gradient-to-r from-primary-600 to-accent-blue bg-clip-text text-transparent dark:from-white dark:to-primary-300">
                OnTrack
              </span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-8 h-8 mx-auto rounded-xl bg-gradient-to-tr from-primary-500 to-accent-blue flex items-center justify-center text-white font-black text-lg cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              O
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border cursor-pointer transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-white"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Card */}
      <div className="p-4 border-b border-gray-50 dark:border-dark-border flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-400 to-secondary-200 p-[2px] shadow-sm">
            <div className="w-full h-full rounded-full bg-white dark:bg-dark-card flex items-center justify-center overflow-hidden font-display font-bold text-primary-600">
              {user?.profile_picture ? (
                <img 
                  src={`${API_BASE_URL}${user.profile_picture}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className={user?.profile_picture ? "hidden" : "flex w-full h-full items-center justify-center"}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-card" />
        </div>
        
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col text-left overflow-hidden"
          >
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-300 truncate leading-none">
              {getGreeting()}
            </span>
            <span className="text-sm font-bold text-gray-800 dark:text-white truncate mt-0.5">
              {user?.name || 'User'}
            </span>
          </motion.div>
        )}
      </div>

      {/* Navigation list */}
      <nav className="flex-grow p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={item.onClickAction}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all relative ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40'
                  : 'hover:bg-gray-50 dark:hover:bg-dark-border text-gray-500 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-6 bg-primary-500 dark:bg-primary-400 rounded-r-md"
                  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                />
              )}

              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-500 dark:text-primary-400' : ''}`} />
              
              {!isCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate">
                  {item.name}
                </motion.span>
              )}

              {/* Badges (e.g. notifications count) */}
              {item.badge && (
                <span className={`absolute ${isCollapsed ? 'top-1 right-1' : 'right-3'} flex items-center justify-center h-4 min-w-[16px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer Controls */}
      <div className="p-3 border-t border-gray-50 dark:border-dark-border space-y-1">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-border cursor-pointer font-semibold text-sm"
          aria-label="Toggle theme mode"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-5 h-5 flex-shrink-0 text-amber-400" />
              {!isCollapsed && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 flex-shrink-0 text-slate-500" />
              {!isCollapsed && <span>Dark Mode</span>}
            </>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/10 cursor-pointer font-semibold text-sm"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
