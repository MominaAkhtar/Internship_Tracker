import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  GitCommit, 
  Trash2, 
  Key, 
  ArrowRight, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar,
  Clock
} from 'lucide-react';
import { getActivityLogs } from '../services/activity';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Tracky } from '../components/mascot/Tracky';

export const ActivityLogs = () => {
  const { showToast } = useToast();
  
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getActivityLogs();
      setLogs(data || []);
    } catch (err) {
      showToast('Error loading activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let result = [...logs];

    // Filter
    if (actionFilter !== 'All') {
      if (actionFilter === 'Auth') {
        result = result.filter(log => log.action_type === 'LOGIN' || log.action_type === 'LOGOUT');
      } else if (actionFilter === 'Applications') {
        result = result.filter(log => 
          log.action_type === 'CREATE_APPLICATION' || 
          log.action_type === 'UPDATE_APPLICATION' || 
          log.action_type === 'DELETE_APPLICATION'
        );
      } else {
        result = result.filter(log => log.action_type === actionFilter);
      }
    }

    // Search
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(log => log.description.toLowerCase().includes(q));
    }

    // Chronological order (latest first)
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredLogs(result);
  }, [logs, actionFilter, search]);

  const getActionConfig = (type) => {
    switch (type) {
      case 'CREATE_APPLICATION':
        return {
          icon: <Plus className="w-4 h-4" />,
          colorClass: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/20',
          label: 'Create Tracker'
        };
      case 'UPDATE_APPLICATION':
        return {
          icon: <Edit2 className="w-4 h-4" />,
          colorClass: 'bg-sky-500/10 text-sky-500 dark:bg-sky-950/20 dark:text-sky-400 border border-sky-500/20',
          label: 'Update Info'
        };
      case 'STATUS_CHANGED':
        return {
          icon: <GitCommit className="w-4 h-4" />,
          colorClass: 'bg-purple-500/10 text-purple-500 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-500/20',
          label: 'Status Shift'
        };
      case 'DELETE_APPLICATION':
        return {
          icon: <Trash2 className="w-4 h-4" />,
          colorClass: 'bg-rose-500/10 text-rose-500 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-500/20',
          label: 'Delete Tracker'
        };
      case 'LOGIN':
        return {
          icon: <Key className="w-4 h-4" />,
          colorClass: 'bg-amber-500/10 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-500/20',
          label: 'Sign In'
        };
      case 'LOGOUT':
        return {
          icon: <Key className="w-4 h-4" />,
          colorClass: 'bg-amber-500/10 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-500/20',
          label: 'Sign Out'
        };
      default:
        return {
          icon: <GitCommit className="w-4 h-4" />,
          colorClass: 'bg-gray-500/10 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-500/20',
          label: 'System Action'
        };
    }
  };

  // Helper to group logs by Date Header
  const groupLogsByDate = (logsList) => {
    const groups = {};
    logsList.forEach(log => {
      const dateObj = new Date(log.created_at);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateKey = '';
      if (dateObj.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (dateObj.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = dateObj.toLocaleDateString(undefined, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });
    return groups;
  };

  const groupedLogs = groupLogsByDate(filteredLogs);

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left relative">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Activity History</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            A chronological, audit-secure record of all actions performed in your workspace.
          </p>
        </div>

        <button 
          onClick={fetchLogs} 
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-border/60 transition-all text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs self-start shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> 
          Refresh Logs
        </button>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white/80 dark:bg-dark-card/85 backdrop-blur-md border border-gray-100 dark:border-dark-border rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-gray-400" />}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1 select-none whitespace-nowrap">
            <Filter className="w-3.5 h-3.5" /> Filter Type
          </span>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white cursor-pointer w-full sm:w-auto"
          >
            <option value="All">All Activities</option>
            <option value="Applications">Application Actions</option>
            <option value="STATUS_CHANGED">Status Shifts</option>
            <option value="Auth">Authentication</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="space-y-8 pl-4 relative before:absolute before:top-4 before:bottom-4 before:left-[17px] before:w-0.5 before:bg-gray-100 dark:before:bg-dark-border/40">
          {[1, 2, 3].map(i => (
            <div key={i} className="relative pl-8 space-y-3">
              <div className="absolute left-[-2.5px] top-1.5 w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-border animate-pulse" />
              <div className="h-5 w-32 bg-gray-200 dark:bg-dark-border rounded-lg animate-pulse" />
              <div className="h-16 w-full bg-gray-50 dark:bg-dark-border/20 rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="space-y-8 pl-4 relative before:absolute before:top-4 before:bottom-4 before:left-[17px] before:w-0.5 before:bg-gradient-to-b before:from-primary-500/30 before:via-gray-100 dark:before:via-dark-border/40 before:to-transparent">
          <AnimatePresence mode="popLayout">
            {Object.keys(groupedLogs).map((dateKey) => (
              <motion.div 
                key={dateKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Date Header */}
                <div className="relative flex items-center gap-3 pl-8 select-none">
                  {/* Glowing Node on Timeline for Header */}
                  <div className="absolute left-[6.5px] w-[23px] h-[23px] rounded-full border-4 border-gray-50 dark:border-dark-bg bg-primary-500 shadow-md shadow-primary-500/20 z-10" />
                  
                  <span className="text-xs uppercase tracking-wider font-extrabold text-primary-500 dark:text-primary-400 bg-primary-500/5 dark:bg-primary-400/5 px-2.5 py-1 rounded-lg border border-primary-500/10">
                    {dateKey}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                    {groupedLogs[dateKey].length} {groupedLogs[dateKey].length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                {/* Group Events cards */}
                <div className="space-y-4">
                  {groupedLogs[dateKey].map((log) => {
                    const config = getActionConfig(log.action_type);
                    const formattedTime = new Date(log.created_at).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <motion.div
                        layout
                        key={log.id}
                        whileHover={{ y: -2 }}
                        className="relative pl-8 group"
                      >
                        {/* Event Icon/Marker */}
                        <div className={`absolute left-[5px] top-4 w-6 h-6 rounded-full flex items-center justify-center border z-10 transition-transform group-hover:scale-110 ${config.colorClass}`}>
                          {config.icon}
                        </div>

                        {/* Card body */}
                        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border hover:border-primary-500/20 dark:hover:border-primary-400/20 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-grow">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${config.colorClass}`}>
                                  {config.label}
                                </span>
                                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {formattedTime}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed text-left">
                                {log.description}
                              </p>
                            </div>
                          </div>

                          {/* Action Diff Display (From -> To) */}
                          {(log.old_value || log.new_value) && (
                            <div className="flex items-center gap-2.5 mt-3.5 bg-gray-50 dark:bg-dark-border/20 p-2.5 rounded-xl border border-gray-100/50 dark:border-dark-border max-w-max text-xs select-none">
                              {log.old_value && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-gray-400 dark:text-gray-500 font-medium">From</span>
                                  <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 font-bold border border-rose-500/10">
                                    {log.old_value}
                                  </span>
                                </div>
                              )}
                              {log.old_value && log.new_value && (
                                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                              )}
                              {log.new_value && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-gray-400 dark:text-gray-500 font-medium">To</span>
                                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold border border-emerald-500/10">
                                    {log.new_value}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-12 text-center shadow-xl flex flex-col items-center gap-4 max-w-lg mx-auto"
        >
          <Tracky expression="thinking" className="w-24 h-24" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Activities Logged</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs leading-relaxed mx-auto">
              We couldn't find any activities matching your filters. Try adding or editing an application tracker.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ActivityLogs;
