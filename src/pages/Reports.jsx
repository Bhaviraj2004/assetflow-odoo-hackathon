import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download } from 'lucide-react';
import { ref, onValue } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";

export default function Reports() {
  const [assets, setAssets] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  useEffect(() => {
    const unsubAssets = onValue(ref(rtdb, 'assets'), (snapshot) => {
      const data = snapshot.val() || {};
      setAssets(Object.entries(data).map(([id, val]) => ({ id, ...val })));
    });
    
    // In case there is a maintenance collection, we fetch it. If not, this gracefully handles an empty collection
    const unsubMaint = onValue(ref(rtdb, 'maintenance'), (snapshot) => {
      const data = snapshot.val() || {};
      setMaintenance(Object.entries(data).map(([id, val]) => ({ id, ...val })));
    });

    const unsubBookings = onValue(ref(rtdb, 'bookings'), (snapshot) => {
      const data = snapshot.val() || {};
      setBookings(Object.entries(data).map(([id, val]) => ({ id, ...val })));
    });

    return () => {
      unsubAssets();
      unsubMaint();
      unsubBookings();
    };
  }, []);

  // Compute dynamic Bar Chart data based on category
  const categoryCounts = assets.reduce((acc, asset) => {
    const cat = asset.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.keys(categoryCounts).length > 0 
    ? Object.keys(categoryCounts).map(k => ({ name: k, value: categoryCounts[k] }))
    : [];

  // Compute Asset Status Breakdown (Pie Chart)
  const statusCounts = assets.reduce((acc, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1;
    return acc;
  }, {});
  
  const pieData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));
  
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#64748b', '#8b5cf6', '#ec4899'];

  // Compute Booking Usage per resource (Bar/Line Chart)
  const bookingCounts = bookings.reduce((acc, booking) => {
    const resourceName = booking.resourceName || 'Unknown';
    acc[resourceName] = (acc[resourceName] || 0) + 1;
    return acc;
  }, {});
  
  const bookingData = Object.keys(bookingCounts).map(name => ({
    name: name,
    bookings: bookingCounts[name]
  }));

  // KPI Metrics
  const totalAssets = assets.length;
  const availableAssetsCount = assets.filter(a => a.status === 'Available').length;
  const maintenanceAssetsCount = assets.filter(a => a.status === 'Maintenance').length;
  const totalBookings = bookings.length;

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <PageHeader 
        title="Reports & Analytics"
        description="Track utilization, maintenance frequency, and asset lifecycle."
        action={
          <Button variant="secondary" icon={Download}>
            Export Report
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-3xl font-bold text-slate-900">{totalAssets}</div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Assets</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm text-center">
          <div className="text-3xl font-bold text-green-600">{availableAssetsCount}</div>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mt-1">Idle / Available</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm text-center">
          <div className="text-3xl font-bold text-amber-600">{maintenanceAssetsCount}</div>
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mt-1">In Maintenance</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm text-center">
          <div className="text-3xl font-bold text-blue-600">{totalBookings}</div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-1">Resource Bookings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        {/* Asset Status Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Asset Status Breakdown</h3>
          <p className="text-xs text-slate-500 mb-6">Real-time status of all company assets.</p>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={80} 
                  outerRadius={120} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Department / Category Wise Assets</h3>
          <p className="text-xs text-slate-500 mb-6">Distribution of assets across different categories.</p>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Usage Line Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col min-h-[350px]">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Resource Booking Usage</h3>
          <p className="text-xs text-slate-500 mb-6">Total number of times each shared resource has been booked.</p>
          <div className="flex-1">
            {bookingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No bookings recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
