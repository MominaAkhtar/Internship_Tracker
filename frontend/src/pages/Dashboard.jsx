import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Briefcase, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Tracky } from '../components/mascot/Tracky';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { getDashboardSummary, getRecentApplications, getUpcomingInterviews } from '../services/dashboard';
import { createApplication } from '../services/applications';

export const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // Dashboard states
  const [summary, setSummary] = useState({
    total_applications: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    upcoming_interviews: 0
  });
  const [recentApps, setRecentApps] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick add form state
  const [quickAdd, setQuickAdd] = useState({
    company_name: '',
    position: '',
    status: 'Applied'
  });
  const [quickAdding, setQuickAdding] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, recentRes, interviewsRes] = await Promise.all([
        getDashboardSummary(),
        getRecentApplications(),
        getUpcomingInterviews()
      ]);
      if (summaryRes) setSummary(summaryRes);
      if (recentRes) setRecentApps(recentRes);
      if (interviewsRes) setInterviews(interviewsRes);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      showToast('Error loading dashboard insights', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    if (!quickAdd.company_name.trim() || !quickAdd.position.trim()) {
      showToast('Please fill out all fields', 'warning');
      return;
    }
    setQuickAdding(true);
    try {
      await createApplication({
        company_name: quickAdd.company_name,
        position: quickAdd.position,
        status: quickAdd.status
      });
      showToast('Application added successfully!', 'success');
      setQuickAdd({ company_name: '', position: '', status: 'Applied' });
      fetchDashboardData(); // Reload data
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to create application', 'error');
    } finally {
      setQuickAdding(false);
    }
  };

  // Setup Pie Chart Data
  const chartData = [
    { name: 'Applied', value: summary.applied, color: '#3389A0' },
    { name: 'Interviewing', value: summary.interview, color: '#3C91AC' },
    { name: 'Offered', value: summary.offer, color: '#10B981' },
    { name: 'Rejected', value: summary.rejected, color: '#F43F5E' },
  ].filter(item => item.value > 0);

  const statCards = [
    { label: 'Total Apps', value: summary.total_applications, color: 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 border-primary-100 dark:border-primary-950' },
    { label: 'Applied', value: summary.applied, color: 'bg-brand-muted/10 text-brand-muted border-brand-muted/20' },
    { label: 'Interviews', value: summary.interview, color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-500 border-amber-100 dark:border-amber-950' },
    { label: 'Offers', value: summary.offer, color: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950' },
    { label: 'Rejected', value: summary.rejected, color: 'bg-rose-50 dark:bg-rose-950/20 text-rose-500 border-rose-100 dark:border-rose-950' },
  ];

  const getTrackyMascotExpression = () => {
    if (summary.offer > 0) return 'celebrating';
    if (summary.interview > 0) return 'excited';
    if (summary.total_applications === 0) return 'waving';
    return 'happy';
  };

  const getTrackyGreetingText = () => {
    if (summary.offer > 0) return `Congratulations, ${user?.name}! You got an offer! Let's secure some more! 🎉`;
    if (summary.interview > 0) return `You have upcoming interviews scheduled! Let's prep and crush them. 💪`;
    if (summary.total_applications === 0) return `Welcome, ${user?.name}! Ready to apply for internships? Let's add your first one below! 🚀`;
    return `Keep pushing, ${user?.name}! Tracky is here to help you organise your career journey. ✨`;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Card & Mascot Greeting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-primary-600 to-accent-blue text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl shadow-primary-500/10 flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 filter blur-2xl" />
          
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Career Journey Status</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight mt-2 text-white">
              Welcome back, {user?.name || 'Explorer'}!
            </h1>
            <p className="text-sm text-primary-100 max-w-md font-medium">
              You have completed {summary.total_applications} application trackers so far. Let's make today productive.
            </p>
          </div>

          <div className="flex gap-4 items-center mt-6 relative z-10">
            <Button
              onClick={() => navigate('/applications')}
              variant="secondary"
              className="bg-white text-primary-700 hover:bg-primary-50 shadow-md font-bold"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Browse Applications
            </Button>
          </div>
        </div>

        {/* Mascot Speech Bubble Card */}
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl flex items-center gap-4 relative overflow-hidden">
          <div className="flex-shrink-0">
            <Tracky expression={getTrackyMascotExpression()} className="w-24 h-24" />
          </div>
          <div className="flex-grow text-left relative">
            {/* Speech bubble tail */}
            <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 dark:bg-dark-border rotate-45 hidden md:block" />
            <div className="p-4 bg-gray-50 dark:bg-dark-border/40 rounded-2xl border border-gray-100/50 dark:border-dark-border text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed shadow-xs">
              {getTrackyGreetingText()}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-5 rounded-2xl border ${card.color} shadow-sm flex flex-col justify-between text-left h-28 relative overflow-hidden`}
          >
            <span className="text-xs uppercase font-bold tracking-wider opacity-80">{card.label}</span>
            <span className="text-3xl font-display font-black leading-none">{card.value}</span>
            <div className="absolute bottom-2 right-2 opacity-5 pointer-events-none">
              <Briefcase className="w-16 h-16" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Central Interactive Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Add Form */}
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
              <Plus className="w-5 h-5 text-primary-500" />
              Quick Add Application
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
              Track a new application instantly in just one click.
            </p>
            
            <form onSubmit={handleQuickAddSubmit} className="space-y-4">
              <Input
                label="Company Name"
                placeholder="e.g. Google"
                value={quickAdd.company_name}
                onChange={e => setQuickAdd({ ...quickAdd, company_name: e.target.value })}
                required
              />
              <Input
                label="Position"
                placeholder="e.g. Software Intern"
                value={quickAdd.position}
                onChange={e => setQuickAdd({ ...quickAdd, position: e.target.value })}
                required
              />
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </label>
                <select
                  value={quickAdd.status}
                  onChange={e => setQuickAdd({ ...quickAdd, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm font-semibold focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offered</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              
              <Button type="submit" disabled={quickAdding} className="w-full mt-2" size="md">
                {quickAdding ? 'Adding...' : 'Add Tracker'}
              </Button>
            </form>
          </div>
        </div>

        {/* Status Counts Chart */}
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              Application Breakdown
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Distribution of your active trackers.
            </p>

            <div className="h-48 w-full flex items-center justify-center">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        background: 'rgba(17, 24, 39, 0.9)', 
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                        fontFamily: 'Inter'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Tracky expression="sleeping" className="w-14 h-14 opacity-50" />
                  <span className="text-xs">No active applications to show</span>
                </div>
              )}
            </div>

            {/* Custom Chart Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-500 dark:text-gray-400 truncate">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Interviews & Deadlines */}
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-primary-500" />
              Upcoming Interviews
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
              Your scheduled conversations with recruiters.
            </p>

            <div className="space-y-3 overflow-y-auto max-h-56 pr-1">
              {interviews.length > 0 ? (
                interviews.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-3.5 bg-gray-50 dark:bg-dark-border/40 border border-gray-100 dark:border-dark-border rounded-2xl flex items-start gap-3 text-left"
                  >
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-white truncate">
                        {item.position}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
                        {item.company_name}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-2">
                        {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
                  <Tracky expression="thinking" className="w-14 h-14 opacity-50" />
                  <span className="text-xs font-semibold">No interviews scheduled yet</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl text-left">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary-500" />
              Recent Applications
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Your latest application tracker logs.
            </p>
          </div>
          <Link 
            to="/applications" 
            className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1 hover:underline"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentApps.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Company</th>
                  <th className="pb-3 font-semibold">Position</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Added Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border font-semibold">
                {recentApps.map((app, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-dark-border/20 transition-colors">
                    <td className="py-3.5 text-gray-800 dark:text-gray-200">{app.company_name}</td>
                    <td className="py-3.5 text-gray-600 dark:text-gray-400">{app.position}</td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        app.status === 'Offered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        app.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        app.status === 'Interviewing' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-primary-50 text-primary-700 border-primary-100'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-gray-400 text-xs font-medium">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
              <Tracky expression="sleeping" className="w-16 h-16 opacity-50" />
              <span className="text-xs">No records found</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
