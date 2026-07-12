import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, AlertTriangle, ArrowRight, Package, Wrench, CheckCircle, Clock } from "lucide-react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { PageHeader } from "../components/ui/PageHeader";

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

  useEffect(() => {
    // Listener for Assets (to get counts for Available, Allocated, Maintenance)
    const qAssets = query(collection(db, "assets"));
    const unsubAssets = onSnapshot(qAssets, (snapshot) => {
      let available = 0, allocated = 0, maintenance = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "Available") available++;
        if (data.status === "Allocated") allocated++;
        if (data.status === "Under Maintenance") maintenance++;
      });
      setMetrics(prev => ({ ...prev, available, allocated, maintenance }));
    });

    // Listener for Active Bookings
    const qBookings = query(collection(db, "bookings"), where("status", "in", ["Upcoming", "Ongoing"]));
    const unsubBookings = onSnapshot(qBookings, (snapshot) => {
      setMetrics(prev => ({ ...prev, activeBookings: snapshot.size }));
    });

    // Listener for Pending Transfers (Allocations with status "Transfer Requested")
    const qTransfers = query(collection(db, "allocations"), where("status", "==", "Transfer Requested"));
    const unsubTransfers = onSnapshot(qTransfers, (snapshot) => {
      setMetrics(prev => ({ ...prev, pendingTransfers: snapshot.size }));
    });

    // Listener for Upcoming Returns (Allocations expected to return soon)
    const qReturns = query(collection(db, "allocations"), where("status", "==", "Allocated"));
    const unsubReturns = onSnapshot(qReturns, (snapshot) => {
      let upcoming = 0;
      const today = new Date();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.expected_return_date) {
          const returnDate = data.expected_return_date.toDate();
          const diffDays = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays <= 7) upcoming++; // Due in next 7 days
        }
      });
      setMetrics(prev => ({ ...prev, upcomingReturns: upcoming }));
    });

    // Listener for Recent Activity (Logs)
    const qLogs = query(collection(db, "activityLogs"), orderBy("timestamp", "desc"), limit(5));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const logs = [];
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      setRecentActivity(logs);
      setLoading(false);
    });

    return () => {
      unsubAssets();
      unsubBookings();
      unsubTransfers();
      unsubReturns();
      unsubLogs();
    };
  }, []);

  const kpis = [
    { label: "Available Assets", value: metrics.available, color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: Package },
    { label: "Allocated", value: metrics.allocated, color: "bg-blue-50 text-blue-700 border-blue-100", icon: CheckCircle },
    { label: "Under Maintenance", value: metrics.maintenance, color: "bg-orange-50 text-orange-700 border-orange-100", icon: Wrench },
    { label: "Active Bookings", value: metrics.activeBookings, color: "bg-purple-50 text-purple-700 border-purple-100", icon: Calendar },
    { label: "Pending Transfers", value: metrics.pendingTransfers, color: "bg-amber-50 text-amber-700 border-amber-100", icon: ArrowRight },
    { label: "Upcoming Returns", value: metrics.upcomingReturns, color: "bg-indigo-50 text-indigo-700 border-indigo-100", icon: Clock },
  ];

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your asset lifecycle and current allocations." 
      />

      {/* Overdue Banner - Example of static logic replaced with dynamic potential if needed */}
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
              <div key={index} className={`p-6 rounded-xl border ${kpi.color} flex flex-col justify-between`}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium opacity-80">{kpi.label}</p>
                  <Icon className="h-4 w-4 opacity-70" />
                </div>
                <p className="text-3xl font-bold tracking-tight">{loading ? "-" : kpi.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Quick Actions</h2>
          <Link to="/assets" className="group flex items-center p-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <div className="bg-blue-50 p-2 rounded-lg mr-3 text-blue-600">
              <Plus className="h-4 w-4" />
            </div>
            Register New Asset
          </Link>
          <Link to="/booking" className="group flex items-center p-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <div className="bg-purple-50 p-2 rounded-lg mr-3 text-purple-600">
              <Calendar className="h-4 w-4" />
            </div>
            Book a Resource
          </Link>
          <Link to="/maintenance" className="group flex items-center p-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <div className="bg-orange-50 p-2 rounded-lg mr-3 text-orange-600">
              <Wrench className="h-4 w-4" />
            </div>
            Raise Maintenance Request
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Activity Feed</h2>
            <Link to="/notifications" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center transition-colors">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500">Loading activity...</div>
            ) : recentActivity.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-500">No recent activity found in the database.</p>
                <p className="text-xs text-slate-400 mt-1">Actions taken in the app will appear here in real-time.</p>
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
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-4 pt-1">
                      {activity.timestamp ? new Date(activity.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
