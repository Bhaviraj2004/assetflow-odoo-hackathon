import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, AlertTriangle, ArrowRight, Package, Wrench, CheckCircle, Clock, BarChart2, LayoutDashboard, Filter } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { PageHeader } from "../components/ui/PageHeader";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

// Helper function to get date range
const getDateRange = (filter) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (filter === "Today") {
    return { start: startOfDay, end: now };
  } else if (filter === "7 Days") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return { start, end: now };
  } else if (filter === "This Month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: now };
  } else if (filter === "Last Month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
    return { start, end };
  }
  return null; // All Time
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    available: 0,
    allocated: 0,
    maintenance: 0,
    activeBookings: 0,
    pendingTransfers: 0,
    upcomingReturns: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New state
  const [activeTab, setActiveTab] = useState("overview"); // overview, analytics
  const [timeFilter, setTimeFilter] = useState("All Time"); // Today, 7 Days, This Month, Last Month, All Time
  const [chartData, setChartData] = useState({
    statusData: [],
    activityTrend: []
  });

  useEffect(() => {
    // Basic Metrics Listeners (Not time filtered, these are current state)
    const unsubAssets = onValue(ref(rtdb, 'assets'), (snapshot) => {
      let available = 0, allocated = 0, maintenance = 0;
      const data = snapshot.val() || {};
      Object.values(data).forEach((item) => {
        if (item.status === "Available") available++;
        if (item.status === "Allocated") allocated++;
        if (item.status === "Under Maintenance") maintenance++;
      });
      setMetrics(prev => ({ ...prev, available, allocated, maintenance }));
      
      // Update chart data for status
      setChartData(prev => ({
        ...prev,
        statusData: [
          { name: 'Available', value: available, color: '#10b981' },
          { name: 'Allocated', value: allocated, color: '#3b82f6' },
          { name: 'Maintenance', value: maintenance, color: '#f97316' }
        ]
      }));
    });

    const unsubBookings = onValue(ref(rtdb, 'bookings'), (snapshot) => {
      let count = 0;
      const data = snapshot.val() || {};
      Object.values(data).forEach((item) => {
        if (item.status === "Upcoming" || item.status === "Ongoing") count++;
      });
      setMetrics(prev => ({ ...prev, activeBookings: count }));
    });

    const unsubTransfers = onValue(ref(rtdb, 'allocations'), (snapshot) => {
      let transfers = 0, upcoming = 0;
      const today = new Date();
      const data = snapshot.val() || {};
      Object.values(data).forEach((item) => {
        if (item.status === "Transfer Requested") transfers++;
        if (item.status === "Allocated" && item.expected_return_date) {
          const returnDate = new Date(item.expected_return_date);
          const diffDays = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays <= 7) upcoming++;
        }
      });
      setMetrics(prev => ({ ...prev, pendingTransfers: transfers, upcomingReturns: upcoming }));
    });

    return () => {
      unsubAssets();
      unsubBookings();
      unsubTransfers();
    };
  }, []);

  // Filtered Data Listener
  useEffect(() => {
    setLoading(true);
    const range = getDateRange(timeFilter);
    
    const unsubLogs = onValue(ref(rtdb, 'activityLogs'), (snapshot) => {
      let logs = [];
      const trendMap = {};
      const data = snapshot.val() || {};
      
      Object.entries(data).forEach(([id, item]) => {
        if (!item.timestamp) return;
        const logDate = new Date(item.timestamp);
        
        // Filter by date
        if (range && (logDate < range.start || logDate > range.end)) {
          return;
        }
        
        logs.push({ id, ...item });
        
        // Aggregate for trend chart
        const dateStr = logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!trendMap[dateStr]) trendMap[dateStr] = 0;
        trendMap[dateStr]++;
      });
      
      // Sort logs descending by timestamp
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // If All Time, limit to top 50 for charts
      if (!range && logs.length > 50) {
        logs = logs.slice(0, 50);
      }
      
      setRecentActivity(logs.slice(0, 5)); // Only show top 5 in feed
      
      // Convert map to array for chart, reverse so oldest is first in array
      const trendArray = Object.keys(trendMap).map(key => ({
        date: key,
        activities: trendMap[key]
      })).reverse();
      
      setChartData(prev => ({ ...prev, activityTrend: trendArray }));
      setLoading(false);
    });

    return () => unsubLogs();
  }, [timeFilter]);

  const kpis = [
    { label: "Assets Available", value: metrics.available, color: "bg-emerald-50 text-emerald-700 border-emerald-100", iconBg: "bg-emerald-200", icon: Package },
    { label: "Assets Allocated", value: metrics.allocated, color: "bg-blue-50 text-blue-700 border-blue-100", iconBg: "bg-blue-200", icon: CheckCircle },
    { label: "Maintenance Today", value: metrics.maintenance, color: "bg-orange-50 text-orange-700 border-orange-100", iconBg: "bg-orange-200", icon: Wrench },
    { label: "Bookings", value: metrics.activeBookings, color: "bg-purple-50 text-purple-700 border-purple-100", iconBg: "bg-purple-200", icon: Calendar },
    { label: "Pending Transfers", value: metrics.pendingTransfers, color: "bg-amber-50 text-amber-700 border-amber-100", iconBg: "bg-amber-200", icon: ArrowRight },
    { label: "Upcoming Returns", value: metrics.upcomingReturns, color: "bg-indigo-50 text-indigo-700 border-indigo-100", iconBg: "bg-indigo-200", icon: Clock },
  ];

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <PageHeader 
          title="Dashboard" 
          description="Overview of your asset lifecycle and current allocations." 
        />
        
        {/* Time Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
          >
            <option value="Today">Today</option>
            <option value="7 Days">Last 7 Days</option>
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
            <option value="All Time">All Time</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'overview' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'analytics' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          Analytics
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Overdue Banner */}
          <div className="mb-8 bg-rose-50/50 border border-rose-200 rounded-xl p-4 flex items-start shadow-sm transition-all hover:shadow-md">
            <AlertTriangle className="h-5 w-5 text-rose-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-rose-900">Action Required: Overdue Assets</h3>
              <p className="mt-1 text-sm text-rose-700 opacity-90">There are assets overdue for return. Please review allocations and send reminders.</p>
            </div>
          </div>

          {/* KPI Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Metrics Overview</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {kpis.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                  <div key={index} className={`p-6 rounded-xl border ${kpi.color} flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-sm duration-200`}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium opacity-90">{kpi.label}</p>
                      <div className={`p-2 rounded-full ${kpi.iconBg}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold tracking-tight">{loading ? "-" : kpi.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions, Notifications, & Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Recent Activity */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Recent Activities</h2>
                <Link to="/notifications" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center transition-colors">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 min-h-[300px]">
                {loading ? (
                  <div className="p-8 text-center text-sm text-slate-500 h-full flex items-center justify-center">Loading activity...</div>
                ) : recentActivity.length === 0 ? (
                  <div className="p-8 text-center h-full flex flex-col items-center justify-center">
                    <p className="text-sm text-slate-500">No activity found for {timeFilter}.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {recentActivity.map((activity) => (
                      <li key={activity.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-start group">
                        <div className="bg-slate-50 border border-slate-100 p-2 rounded-full mr-4 text-slate-500 group-hover:border-slate-200 transition-colors">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-sm text-slate-700 font-medium">{activity.action}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{activity.entity}</p>
                        </div>
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-2 pt-1">
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="lg:col-span-1 flex flex-col">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Notifications</h2>
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 min-h-[300px] p-4 flex flex-col gap-3">
                {recentActivity.filter(a => a.action.toLowerCase().includes('overdue') || a.action.toLowerCase().includes('discrepancy')).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <CheckCircle className="h-8 w-8 text-emerald-400 mb-2" />
                    <p className="text-sm text-slate-500">No new alerts</p>
                    <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  recentActivity.filter(a => a.action.toLowerCase().includes('overdue') || a.action.toLowerCase().includes('discrepancy')).map(alert => (
                    <div key={alert.id} className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-start">
                      <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-rose-900 font-medium">{alert.action}</p>
                        <p className="text-xs text-rose-700 mt-0.5">{alert.entity}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-1 flex flex-col">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Quick Actions</h2>
              <div className="flex flex-col gap-3">
                <Link to="/assets" className="group flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-center">
                  <div className="bg-blue-50 p-2.5 rounded-full mb-2 text-blue-600 group-hover:scale-110 transition-transform">
                    <Plus className="h-5 w-5" />
                  </div>
                  Register Asset
                </Link>
                <Link to="/booking" className="group flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-center">
                  <div className="bg-purple-50 p-2.5 rounded-full mb-2 text-purple-600 group-hover:scale-110 transition-transform">
                    <Calendar className="h-5 w-5" />
                  </div>
                  Book Resource
                </Link>
                <Link to="/maintenance" className="group flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-center">
                  <div className="bg-orange-50 p-2.5 rounded-full mb-2 text-orange-600 group-hover:scale-110 transition-transform">
                    <Wrench className="h-5 w-5" />
                  </div>
                  Raise Request
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Analytics Tab Content */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Status Distribution (Pie Chart) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6">Asset Status Distribution</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value, name) => [`${value} Assets`, name]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity Trend (Bar Chart) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6">Activity Trend ({timeFilter})</h3>
              <div className="h-[300px] w-full">
                {chartData.activityTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData.activityTrend}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                      <RechartsTooltip 
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="activities" name="Actions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-500">
                    No activity data available for this period.
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
