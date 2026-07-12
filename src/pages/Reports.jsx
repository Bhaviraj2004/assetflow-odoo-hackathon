import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download } from 'lucide-react';
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Reports() {
  const [assets, setAssets] = useState([]);
  
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "assets"), (snapshot) => {
      setAssets(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsub();
  }, []);

  // Compute dynamic Bar Chart data based on category (since department is on allocation, category is easier)
  const categoryCounts = assets.reduce((acc, asset) => {
    const cat = asset.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.keys(categoryCounts).length > 0 
    ? Object.keys(categoryCounts).map(k => ({ name: k, value: categoryCounts[k] }))
    : [
      { name: 'Electronics', value: 0 },
      { name: 'Furniture', value: 0 },
      { name: 'Vehicles', value: 0 }
    ];

  // Static line data for maintenance frequency as it requires complex time-series aggregation
  const lineData = [
    { name: 'Jan', value: 12 },
    { name: 'Feb', value: 15 },
    { name: 'Mar', value: 25 },
    { name: 'Apr', value: 18 },
    { name: 'May', value: 30 },
  ];

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="mt-1 text-sm md:text-base text-slate-500">Track utilization, maintenance frequency, and asset lifecycle.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Assets by Category</h3>
          <div className="h-64">
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

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Maintenance Frequency</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Total Assets</h3>
          <div className="text-4xl font-bold text-slate-900">{assets.length}</div>
          <p className="text-sm text-slate-500 mt-2">Registered in the system</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Idle Assets</h3>
          <ul className="space-y-3">
            <li className="text-sm">
              <span className="font-medium text-slate-800">Camera AF-0901:</span> <span className="text-slate-500">unused 60+ days</span>
            </li>
            <li className="text-sm">
              <span className="font-medium text-slate-800">Chair AF-0410:</span> <span className="text-slate-500">unused 45 days</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Due for Replacement</h3>
          <ul className="space-y-3">
            <li className="text-sm">
              <span className="font-medium text-slate-800">Forklift AF-0087:</span> <span className="text-slate-500">service due in 5 days</span>
            </li>
            <li className="text-sm">
              <span className="font-medium text-slate-800">Laptop AF-0020:</span> <span className="text-slate-500">4 years old - nearing retirement</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
