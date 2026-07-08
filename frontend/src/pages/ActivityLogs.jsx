import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, Filter, RefreshCw, Info } from 'lucide-react';
import { getActivityLogs } from '../services/activity';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { ListSkeleton } from '../components/common/Skeleton';
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

  const getActionBadgeColor = (type) => {
    switch (type) {
      case 'CREATE_APPLICATION':
        return 'success';
      case 'UPDATE_APPLICATION':
        return 'primary';
      case 'STATUS_CHANGED':
        return 'secondary';
      case 'DELETE_APPLICATION':
        return 'danger';
      case 'LOGIN':
      case 'LOGOUT':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const getFriendlyActionType = (type) => {
    return String(type).replace('_', ' ');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Activity Logs</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            A secure audit trail of all changes made to your internship trackers.
          </p>
        </div>

        <button 
          onClick={fetchLogs} 
          className="p-2.5 rounded-xl border border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card transition-all text-gray-500 hover:text-primary-500 dark:text-gray-300 flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs self-start"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-5 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-xs">
          <Input
            placeholder="Search activity description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-gray-400" />}
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Logs
          </span>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="All">All Activities</option>
            <option value="Applications">Application Actions</option>
            <option value="STATUS_CHANGED">Status Shifts</option>
            <option value="Auth">Auth (Login/Logout)</option>
          </select>
        </div>
      </div>

      {/* Logs Display List */}
      {loading ? (
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl">
          <ListSkeleton count={6} />
        </div>
      ) : filteredLogs.length > 0 ? (
        <motion.div 
          layout
          className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl space-y-4 text-left"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3 text-left font-semibold">Activity</th>
                  <th className="pb-3 text-center font-semibold">Action</th>
                  <th className="pb-3 text-right font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border font-semibold">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-border/20 transition-colors">
                    <td className="py-4 text-left pr-4">
                      <div className="space-y-1">
                        <span className="text-gray-800 dark:text-gray-200 block text-sm font-semibold">
                          {log.description}
                        </span>
                        
                        {(log.old_value || log.new_value) && (
                          <div className="inline-flex flex-wrap items-center gap-1.5 text-[10px] text-gray-400 font-semibold bg-gray-50 dark:bg-dark-border/30 px-2 py-1 rounded-lg">
                            {log.old_value && (
                              <span>From: <code className="text-rose-500 font-bold">{log.old_value}</code></span>
                            )}
                            {log.old_value && log.new_value && <span>→</span>}
                            {log.new_value && (
                              <span>To: <code className="text-emerald-500 font-bold">{log.new_value}</code></span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <Badge variant={getActionBadgeColor(log.action_type)}>
                        {getFriendlyActionType(log.action_type)}
                      </Badge>
                    </td>
                    <td className="py-4 text-right text-gray-400 text-xs font-medium">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        /* Empty states */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-12 text-center shadow-lg flex flex-col items-center gap-4 max-w-lg mx-auto"
        >
          <Tracky expression="thinking" className="w-28 h-28" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold">No logs recorded</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs leading-relaxed mx-auto">
              Your logs are currently clear. Try updating an application or log in/out to generate records.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ActivityLogs;
