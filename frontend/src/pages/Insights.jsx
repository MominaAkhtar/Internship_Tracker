import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Legend 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Building2, 
  Timer, 
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { 
  getOverview, 
  getStatusAnalysis, 
  getCompanyAnalysis, 
  getResponseTimeAnalysis, 
  getMonthlyTrends, 
  getWeeklyConsistency 
} from '../services/insights';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { Tracky } from '../components/mascot/Tracky';

export const Insights = () => {
  const { showToast } = useToast();
  
  // Analytics State
  const [overview, setOverview] = useState({
    total_applications: 0,
    total_interviews: 0,
    total_offers: 0,
    total_rejections: 0,
    success_rate: 0,
    most_common_status: null,
    most_active_month: null,
    average_response_time: null,
  });

  const [statusData, setStatusData] = useState({ statuses: [], recommendation: '' });
  const [companyData, setCompanyData] = useState({ companies: [], recommendation: '' });
  const [responseTimeData, setResponseTimeData] = useState({
    average_interview_response: null,
    average_offer_response: null,
    average_rejection_response: null,
    recommendation: '',
  });
  const [monthlyData, setMonthlyData] = useState({ trends: [], recommendation: '' });
  const [weeklyData, setWeeklyData] = useState({ weeks: [], recommendation: '' });
  const [loading, setLoading] = useState(true);

  // Active Tab State
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [
        overviewRes,
        statusRes,
        companyRes,
        responseRes,
        monthlyRes,
        weeklyRes
      ] = await Promise.all([
        getOverview(),
        getStatusAnalysis(),
        getCompanyAnalysis(),
        getResponseTimeAnalysis(),
        getMonthlyTrends(),
        getWeeklyConsistency()
      ]);

      if (overviewRes) setOverview(overviewRes);
      if (statusRes) setStatusData(statusRes);
      if (companyRes) setCompanyData(companyRes);
      if (responseRes) setResponseTimeData(responseRes);
      if (monthlyRes) setMonthlyData(monthlyRes);
      if (weeklyRes) setWeeklyData(weeklyRes);
    } catch (err) {
      console.error('Error fetching insights', err);
      showToast('Could not fetch career analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getTabClass = (tabName) => {
    const isActive = activeTab === tabName;
    return `px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
      isActive 
        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10' 
        : 'hover:bg-gray-100 dark:hover:bg-dark-border text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
    }`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Tracky expression="loading" className="w-16 h-16" />
        <span className="text-xs uppercase font-bold tracking-widest text-gray-400 dark:text-gray-600 animate-pulse mt-4">
          Analyzing career insights...
        </span>
      </div>
    );
  }

  // Setup response time chart data
  const responseTimeChartData = [
    { name: 'Interview Offer', days: responseTimeData.average_interview_response || 0, color: '#3389A0' },
    { name: 'Job Offer', days: responseTimeData.average_offer_response || 0, color: '#10B981' },
    { name: 'Rejection letter', days: responseTimeData.average_rejection_response || 0, color: '#F43F5E' },
  ].filter(item => item.days > 0);

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black">Career Insights</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          In-depth statistics and charts of your internship application metrics.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 dark:border-dark-border pb-4">
        <button onClick={() => setActiveTab('overview')} className={getTabClass('overview')}>
          Overview
        </button>
        <button onClick={() => setActiveTab('trends')} className={getTabClass('trends')}>
          Trends & Consistency
        </button>
        <button onClick={() => setActiveTab('companies')} className={getTabClass('companies')}>
          Company Performance
        </button>
        <button onClick={() => setActiveTab('response')} className={getTabClass('response')}>
          Response Times
        </button>
      </div>

      {/* Dynamic Tab Content rendering */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-5 shadow-md text-left flex flex-col justify-between h-32">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Acceptance Ratio</span>
              <span className="text-4xl font-display font-black text-emerald-500">{overview.success_rate}%</span>
              <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Convert rate from total applications
              </span>
            </div>

            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-5 shadow-md text-left flex flex-col justify-between h-32">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Total Interviews</span>
              <span className="text-4xl font-display font-black text-primary-500">{overview.total_interviews}</span>
              <span className="text-[10px] text-gray-400 font-semibold">Conversations generated</span>
            </div>

            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-5 shadow-md text-left flex flex-col justify-between h-32">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Average Response</span>
              <span className="text-4xl font-display font-black text-amber-500">
                {overview.average_response_time ? `${overview.average_response_time} Days` : 'N/A'}
              </span>
              <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-amber-500" /> Avg days to get status updates
              </span>
            </div>

            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-5 shadow-md text-left flex flex-col justify-between h-32">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Peak Active Month</span>
              <span className="text-3xl font-display font-black text-purple-500 truncate mt-1">
                {overview.most_active_month || 'N/A'}
              </span>
              <span className="text-[10px] text-gray-400 font-semibold">Month with highest volume</span>
            </div>
          </div>

          {/* Core breakdown & Recommendation row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl text-left">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary-500" /> Status distribution
              </h3>
              
              <div className="h-64 w-full">
                {statusData.statuses.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData.statuses}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                      <XAxis dataKey="status" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="count" fill="#3389A0" radius={[8, 8, 0, 0]} maxBarSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                    <Tracky expression="sleeping" className="w-12 h-12 opacity-50" />
                    <span className="text-xs font-semibold">No status data recorded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations Bubble Card */}
            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-xl">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold">Tracky's Advice</h3>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-dark-border/40 rounded-2xl border border-gray-100/50 dark:border-dark-border text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">
                  {statusData.recommendation || "Maintain a daily application routine and add notes containing links to stand out."}
                </div>
              </div>
              <div className="flex justify-center pt-6">
                <Tracky expression="thinking" className="w-24 h-24" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly & Monthly consistency */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly trend */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl text-left">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-primary-500" /> Monthly Trends
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">{monthlyData.recommendation}</p>

            <div className="h-64 w-full">
              {monthlyData.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData.trends}>
                    <defs>
                      <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3389A0" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3389A0" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="applications" stroke="#3389A0" fillOpacity={1} fill="url(#colorMonth)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                  <Tracky expression="sleeping" className="w-12 h-12 opacity-50" />
                  <span className="text-xs">No monthly trends recorded</span>
                </div>
              )}
            </div>
          </div>

          {/* Weekly consistency */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl text-left">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-primary-500" /> Weekly Consistency
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">{weeklyData.recommendation}</p>

            <div className="h-64 w-full">
              {weeklyData.weeks.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData.weeks}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="week" stroke="#9ca3af" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="applications" stroke="#3C91AC" strokeWidth={3} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                  <Tracky expression="sleeping" className="w-12 h-12 opacity-50" />
                  <span className="text-xs">No weekly metrics recorded</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Company performance */}
      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-primary-500" /> Top Recruiting Companies
            </h3>

            <div className="overflow-x-auto">
              {companyData.companies.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-dark-border text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-3 text-left">Company</th>
                      <th className="pb-3 text-center">Applications</th>
                      <th className="pb-3 text-center">Interviews</th>
                      <th className="pb-3 text-center">Offers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-dark-border font-semibold">
                    {companyData.companies.map((c, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-dark-border/20 transition-colors">
                        <td className="py-3.5 text-left text-gray-800 dark:text-gray-200">{c.company_name}</td>
                        <td className="py-3.5 text-center text-gray-500 dark:text-gray-400">{c.applications}</td>
                        <td className="py-3.5 text-center text-amber-500">{c.interviews}</td>
                        <td className="py-3.5 text-center text-emerald-500">{c.offers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Tracky expression="sleeping" className="w-12 h-12 opacity-50" />
                  <span className="text-xs mt-2">No companies tracked</span>
                </div>
              )}
            </div>
          </div>

          {/* Company Recommendation Card */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">Company Insights</h3>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-dark-border/40 rounded-2xl border border-gray-100/50 dark:border-dark-border text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">
                {companyData.recommendation || "Submit applications across different organizations to track conversion rates."}
              </div>
            </div>
            <div className="flex justify-center pt-6">
              <Tracky expression="excited" className="w-24 h-24" />
            </div>
          </div>
        </div>
      )}

      {/* Response times analysis */}
      {activeTab === 'response' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
              <Timer className="w-5 h-5 text-primary-500" /> Response Timelines (Days)
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
              Average latency between application submission and recruiter contact.
            </p>

            <div className="h-64 w-full">
              {responseTimeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={responseTimeChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                    <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="days" fill="#3C91AC" radius={[0, 8, 8, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                  <Tracky expression="sleeping" className="w-12 h-12 opacity-50" />
                  <span className="text-xs">No response timeline data</span>
                </div>
              )}
            </div>
          </div>

          {/* Response recommendation card */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">Follow-Up Suggestion</h3>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-dark-border/40 rounded-2xl border border-gray-100/50 dark:border-dark-border text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">
                {responseTimeData.recommendation || "When follow-ups are due, send a friendly check-in email to the recruiter."}
              </div>
            </div>
            <div className="flex justify-center pt-6">
              <Tracky expression="thinking" className="w-24 h-24" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;
