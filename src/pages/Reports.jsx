import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download } from 'lucide-react';
import { ref, onValue } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";

export default function Reports() {
  const [assets, setAssets] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  
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

    return () => {
      unsubAssets();
      unsubMaint();
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
    : [{ name: 'No Data', value: 0 }];

  // Compute dynamic Maintenance Frequency based on asset status
  const maintenanceAssets = assets.filter(a => a.status === 'Under Maintenance');
  const availableAssets = assets.filter(a => a.status === 'Available');
  
  const lineData = [
    { name: 'Active', value: assets.length - maintenanceAssets.length },
    { name: 'Maintenance', value: maintenanceAssets.length },
    { name: 'Total', value: assets.length }
  ];

  // Idle Assets (Available for a long time - for POC we just show Available assets)
  const idleAssets = availableAssets.slice(0, 3); // top 3

  // Due for replacement (Condition is poor or very old)
  const replacementAssets = assets.filter(a => a.condition === 'Poor' || a.condition === 'Damaged').slice(0, 3);

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
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Available Assets</h3>
          <ul className="space-y-3">
            {idleAssets.length > 0 ? idleAssets.map(asset => (
              <li key={asset.id} className="text-sm">
                <span className="font-medium text-slate-800">{asset.name} ({asset.tag}):</span> <span className="text-slate-500">Ready to use</span>
              </li>
            )) : (
              <li className="text-sm text-slate-500">No available assets at the moment.</li>
            )}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Needs Attention</h3>
          <ul className="space-y-3">
            {replacementAssets.length > 0 ? replacementAssets.map(asset => (
              <li key={asset.id} className="text-sm">
                <span className="font-medium text-slate-800">{asset.name} ({asset.tag}):</span> <span className="text-red-500">{asset.condition} condition</span>
              </li>
            )) : (
              <li className="text-sm text-slate-500">All assets are in good condition!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
