import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Building2,
  Timer,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import {
  getOverview,
  getStatusAnalysis,
  getCompanyAnalysis,
  getResponseTimeAnalysis,
  getMonthlyTrends,
  getWeeklyConsistency,
} from '../services/insights';
import { useToast } from '../context/ToastContext';
import { Tracky } from '../components/mascot/Tracky';

/* ── Chart design tokens ── */
const CHART = {
  margin: { top: 8, right: 16, left: 0, bottom: 4 },
  marginWide: { top: 8, right: 24, left: 4, bottom: 4 },
  grid: {
    stroke: 'rgba(148, 163, 184, 0.18)',
    strokeDark: 'rgba(148, 163, 184, 0.12)',
    dasharray: '4 4',
  },
  axis: {
    fill: '#94a3b8',
    fillDark: '#64748b',
    fontSize: 12,
    fontWeight: 500,
  },
  animation: { duration: 800, easing: 'ease-out' },
  colors: {
    primary: '#3389A0',
    primaryLight: '#4ba0b8',
    accent: '#3c91ac',
    success: '#34d399',
    successDark: '#10b981',
    warning: '#fbbf24',
    warningDark: '#f59e0b',
    rose: '#fb7185',
    slate: '#64748b',
    barPalette: ['#3389A0', '#4ba0b8', '#3c91ac', '#679ba9', '#7ebfd0', '#aed9e2'],
  },
};

const ChartTooltipCard = ({ label, value, unit, color = CHART.colors.primary }) => {
  if (value == null) return null;
  return (
    <div className="bg-white dark:bg-[#1a2332] border border-gray-100/80 dark:border-white/[0.08] px-3.5 py-2.5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] text-left select-none">
      <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
          {value} {unit}
        </p>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <ChartTooltipCard
      label={label}
      value={val}
      unit={val === 1 ? 'Application' : 'Applications'}
      color={payload[0].color || payload[0].payload?.fill || CHART.colors.primary}
    />
  );
};

const ResponseTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <ChartTooltipCard
      label={label}
      value={val}
      unit={val === 1 ? 'Day avg.' : 'Days avg.'}
      color={payload[0].payload?.color || CHART.colors.warningDark}
    />
  );
};

const ChartEmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
    <Tracky expression="sleeping" className="w-12 h-12 opacity-50" />
    <span className="text-xs font-medium">{message}</span>
  </div>
);

const ChartCard = ({ title, icon: Icon, subtitle, children }) => (
  <div className="bg-white dark:bg-dark-card border border-gray-100/80 dark:border-dark-border rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-none text-left">
    <div className="mb-6">
      <h3 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary-500/10">
          <Icon className="w-4 h-4 text-primary-500" strokeWidth={2} />
        </span>
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 leading-relaxed max-w-prose">{subtitle}</p>
      )}
    </div>
    {children}
  </div>
);

export const Insights = () => {
  const { showToast } = useToast();

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
        weeklyRes,
      ] = await Promise.all([
        getOverview(),
        getStatusAnalysis(),
        getCompanyAnalysis(),
        getResponseTimeAnalysis(),
        getMonthlyTrends(),
        getWeeklyConsistency(),
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
    return `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
      isActive
        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/15'
        : 'hover:bg-gray-100 dark:hover:bg-dark-border text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
    }`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Tracky expression="loading" className="w-16 h-16" />
        <span className="text-xs uppercase font-semibold tracking-widest text-gray-400 dark:text-gray-600 animate-pulse mt-4">
          Analyzing career insights...
        </span>
      </div>
    );
  }

  const responseTimeChartData = [
    { name: 'Interview Offer', days: responseTimeData.average_interview_response || 0, color: CHART.colors.primary },
    { name: 'Job Offer', days: responseTimeData.average_offer_response || 0, color: CHART.colors.successDark },
    { name: 'Rejection letter', days: responseTimeData.average_rejection_response || 0, color: CHART.colors.rose },
  ].filter((item) => item.days > 0);

  const axisTick = {
    fill: CHART.axis.fill,
    fontSize: CHART.axis.fontSize,
    fontWeight: CHART.axis.fontWeight,
  };

  const tooltipCursor = { fill: 'rgba(51, 137, 160, 0.06)', radius: 6 };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Career Insights</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          In-depth statistics and charts of your internship application metrics.
        </p>
      </div>

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

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { label: 'Acceptance Ratio', value: `${overview.success_rate}%`, sub: 'Convert rate from total applications', color: 'text-emerald-500', icon: CheckCircle, iconColor: 'text-emerald-500' },
              { label: 'Total Interviews', value: overview.total_interviews, sub: 'Conversations generated', color: 'text-primary-500', icon: null },
              { label: 'Average Response', value: overview.average_response_time ? `${overview.average_response_time} Days` : 'No data available', sub: 'Avg days to get status updates', color: 'text-amber-500', icon: Timer, iconColor: 'text-amber-500' },
              { label: 'Peak Active Month', value: overview.most_active_month || 'No data available', sub: 'Month with highest volume', color: 'text-purple-500', icon: null, small: true },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white dark:bg-dark-card border border-gray-100/80 dark:border-dark-border rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between h-32"
              >
                <span className="text-[11px] uppercase font-semibold tracking-wider text-gray-400">{card.label}</span>
                <span className={`${card.small ? 'text-2xl' : 'text-4xl'} font-display font-bold ${card.color} truncate`}>
                  {card.value}
                </span>
                <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                  {card.icon && <card.icon className={`w-3.5 h-3.5 ${card.iconColor}`} />}
                  {card.sub}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartCard title="Status distribution" icon={BarChart3}>
                <div className="h-72 w-full -mx-1">
                  {statusData.statuses.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusData.statuses} margin={CHART.margin} barCategoryGap="28%">
                        <CartesianGrid
                          strokeDasharray={CHART.grid.dasharray}
                          vertical={false}
                          stroke={CHART.grid.stroke}
                        />
                        <XAxis
                          dataKey="status"
                          tick={axisTick}
                          tickLine={false}
                          axisLine={false}
                          dy={8}
                          interval={0}
                        />
                        <YAxis
                          tick={axisTick}
                          tickLine={false}
                          axisLine={false}
                          dx={-4}
                          allowDecimals={false}
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={tooltipCursor}
                          animationDuration={200}
                        />
                        <Bar
                          dataKey="count"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={40}
                          isAnimationActive
                          animationDuration={CHART.animation.duration}
                          animationEasing={CHART.animation.easing}
                        >
                          {statusData.statuses.map((_, index) => (
                            <Cell
                              key={`status-${index}`}
                              fill={CHART.colors.barPalette[index % CHART.colors.barPalette.length]}
                              fillOpacity={0.9}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmptyState message="No status data recorded" />
                  )}
                </div>
              </ChartCard>
            </div>

            <div className="bg-white dark:bg-dark-card border border-gray-100/80 dark:border-dark-border rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-xl">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold">Tracky&apos;s Advice</h3>
                </div>
                <div className="p-4 bg-gray-50/80 dark:bg-dark-border/30 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {statusData.recommendation || 'Maintain a daily application routine and add notes containing links to stand out.'}
                </div>
              </div>
              <div className="flex justify-center pt-6">
                <Tracky expression="thinking" className="w-24 h-24" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Monthly Trends" icon={Calendar} subtitle={monthlyData.recommendation}>
            <div className="h-72 w-full -mx-1">
              {monthlyData.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData.trends} margin={CHART.margin}>
                    <defs>
                      <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART.colors.primary} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={CHART.colors.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray={CHART.grid.dasharray}
                      vertical={false}
                      stroke={CHART.grid.stroke}
                    />
                    <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} dy={8} />
                    <YAxis tick={axisTick} tickLine={false} axisLine={false} dx={-4} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} animationDuration={200} />
                    <Area
                      type="monotone"
                      dataKey="applications"
                      stroke={CHART.colors.primary}
                      strokeWidth={2}
                      fill="url(#monthlyGradient)"
                      dot={false}
                      activeDot={{
                        r: 5,
                        strokeWidth: 2,
                        stroke: '#fff',
                        fill: CHART.colors.primary,
                      }}
                      isAnimationActive
                      animationDuration={CHART.animation.duration}
                      animationEasing={CHART.animation.easing}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmptyState message="No monthly trends recorded" />
              )}
            </div>
          </ChartCard>

          <ChartCard title="Weekly Consistency" icon={TrendingUp} subtitle={weeklyData.recommendation}>
            <div className="h-72 w-full -mx-1">
              {weeklyData.weeks.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData.weeks} margin={CHART.margin}>
                    <CartesianGrid
                      strokeDasharray={CHART.grid.dasharray}
                      vertical={false}
                      stroke={CHART.grid.stroke}
                    />
                    <XAxis dataKey="week" tick={axisTick} tickLine={false} axisLine={false} dy={8} />
                    <YAxis tick={axisTick} tickLine={false} axisLine={false} dx={-4} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} animationDuration={200} />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      stroke={CHART.colors.warningDark}
                      strokeWidth={2.5}
                      dot={{
                        r: 3,
                        strokeWidth: 0,
                        fill: CHART.colors.warningDark,
                      }}
                      activeDot={{
                        r: 5,
                        strokeWidth: 2,
                        stroke: '#fff',
                        fill: CHART.colors.warningDark,
                      }}
                      isAnimationActive
                      animationDuration={CHART.animation.duration}
                      animationEasing={CHART.animation.easing}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmptyState message="No weekly metrics recorded" />
              )}
            </div>
          </ChartCard>
        </div>
      )}

      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-gray-100/80 dark:border-dark-border rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-semibold flex items-center gap-2 mb-6 text-gray-900 dark:text-white">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary-500/10">
                <Building2 className="w-4 h-4 text-primary-500" strokeWidth={2} />
              </span>
              Top Recruiting Companies
            </h3>

            <div className="overflow-x-auto">
              {companyData.companies.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-dark-border text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="pb-3 text-left font-semibold">Company</th>
                      <th className="pb-3 text-center font-semibold">Applications</th>
                      <th className="pb-3 text-center font-semibold">Interviews</th>
                      <th className="pb-3 text-center font-semibold">Offers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-dark-border font-medium">
                    {companyData.companies.map((c, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60 dark:hover:bg-dark-border/20 transition-colors">
                        <td className="py-3.5 text-left text-gray-800 dark:text-gray-200">{c.company_name}</td>
                        <td className="py-3.5 text-center text-gray-500 dark:text-gray-400 tabular-nums">{c.applications}</td>
                        <td className="py-3.5 text-center text-amber-500 tabular-nums">{c.interviews}</td>
                        <td className="py-3.5 text-center text-emerald-500 tabular-nums">{c.offers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <ChartEmptyState message="No companies tracked" />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card border border-gray-100/80 dark:border-dark-border rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold">Company Insights</h3>
              </div>
              <div className="p-4 bg-gray-50/80 dark:bg-dark-border/30 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                {companyData.recommendation || 'Submit applications across different organizations to track conversion rates.'}
              </div>
            </div>
            <div className="flex justify-center pt-6">
              <Tracky expression="excited" className="w-24 h-24" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'response' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          <div className="lg:col-span-2">
            <ChartCard
              title="Response Timelines (Days)"
              icon={Timer}
              subtitle="Average latency between application submission and recruiter contact."
            >
              <div className="h-72 w-full -mx-1">
                {responseTimeChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={responseTimeChartData}
                      layout="vertical"
                      margin={CHART.marginWide}
                      barCategoryGap="32%"
                    >
                      <CartesianGrid
                        strokeDasharray={CHART.grid.dasharray}
                        horizontal={false}
                        stroke={CHART.grid.stroke}
                      />
                      <XAxis
                        type="number"
                        tick={axisTick}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={axisTick}
                        tickLine={false}
                        axisLine={false}
                        width={120}
                      />
                      <Tooltip
                        content={<ResponseTooltip />}
                        cursor={{ fill: 'rgba(51, 137, 160, 0.06)', radius: 4 }}
                        animationDuration={200}
                      />
                      <Bar
                        dataKey="days"
                        radius={[0, 6, 6, 0]}
                        maxBarSize={24}
                        isAnimationActive
                        animationDuration={CHART.animation.duration}
                        animationEasing={CHART.animation.easing}
                      >
                        {responseTimeChartData.map((entry, index) => (
                          <Cell key={`response-${index}`} fill={entry.color} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartEmptyState message="No response timeline data" />
                )}
              </div>
            </ChartCard>
          </div>

          <div className="bg-white dark:bg-dark-card border border-gray-100/80 dark:border-dark-border rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold">Follow-Up Suggestion</h3>
              </div>
              <div className="p-4 bg-gray-50/80 dark:bg-dark-border/30 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                {responseTimeData.recommendation || 'When follow-ups are due, send a friendly check-in email to the recruiter.'}
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