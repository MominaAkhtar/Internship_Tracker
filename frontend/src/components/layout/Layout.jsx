import React, { useState } from 'react';
import Sidebar from './Sidebar';
import NotificationDrawer from './NotificationDrawer';
import { Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-gray-200 overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
          onOpenNotificationsDrawer={() => setNotificationsOpen(true)}
        />
      </div>

      {/* Mobile Sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Slide-out Sidebar container */}
          <div className="relative w-64 bg-white dark:bg-dark-card h-full flex flex-col pointer-events-auto">
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-300"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Sidebar
              isCollapsed={false}
              setIsCollapsed={() => {}}
              onOpenNotificationsDrawer={() => {
                setMobileSidebarOpen(false);
                setNotificationsOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-gray-100 dark:border-dark-border py-3 px-6 flex items-center justify-between z-20 min-h-[65px]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors text-gray-500 dark:text-gray-300 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold tracking-tight text-gray-800 dark:text-white capitalize hidden md:block">
              OnTrack Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="p-2 rounded-xl border border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card transition-all text-gray-500 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-400 relative cursor-pointer"
              aria-label="Open notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Profile Avatar details */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-400 to-secondary-200 p-[1px]">
              <div className="w-full h-full rounded-full bg-white dark:bg-dark-card flex items-center justify-center overflow-hidden font-display font-bold text-xs text-primary-600">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Container */}
        <main className="flex-grow p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
};

export default Layout;
