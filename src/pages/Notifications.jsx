import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../lib/firebase";

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("Activity Logs");
  
  const tabs = ["Activity Logs", "Alerts"];

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // We treat "notifications" simply as an activity log viewer for this hackathon
    // Alerts could be derived from logs or actual notification objects. 
    // We will just read activityLogs.
    const unsub = onValue(ref(rtdb, 'activityLogs'), (snapshot) => {
      const data = snapshot.val() || {};
      const logsArray = Object.entries(data).map(([id, val]) => ({ id, ...val }));
      logsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setLogs(logsArray);
    });
    
    return () => unsub();
  }, []);

  const markRead = async (logId) => {
    // For a real app, notifications have read status. 
    // Here we'll just mock it or assume all logs are "read" when viewed.
    // If we had a read field: await updateDoc(doc(db, "activityLogs", logId), { read: true });
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Activity Logs & Notifications</h1>
          <p className="mt-1 text-sm md:text-base text-slate-500">Track all system activities and alerts.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="p-4 border-b border-slate-200 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                activeTab === tab
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No activity recorded yet.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {logs.map((log) => {
                const isAlert = log.action.toLowerCase().includes("overdue") || log.action.toLowerCase().includes("discrepancy");
                
                if (activeTab === "Alerts" && !isAlert) return null;
                
                return (
                  <li key={log.id} className="p-4 flex items-start hover:bg-slate-50 transition-colors">
                    <div className="mr-4 mt-0.5 text-slate-400">
                      {isAlert ? <Circle className="h-5 w-5 text-red-500" /> : <Clock className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm text-slate-700 ${isAlert ? 'text-red-700 font-medium' : ''}`}>
                        <span className="font-semibold text-slate-900">{log.action}:</span> {log.entity}
                      </p>
                    </div>
                    <div className="ml-4 text-xs text-slate-400 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
