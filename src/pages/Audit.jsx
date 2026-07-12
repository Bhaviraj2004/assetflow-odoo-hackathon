import { useState, useEffect } from "react";
import { Plus, X, Search, CheckCircle, AlertTriangle } from "lucide-react";
import { collection, query, onSnapshot, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function Audit() {
  const { userData } = useAuth();
  const [audits, setAudits] = useState([]);
  const [assets, setAssets] = useState([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("");
  
  const [activeAudit, setActiveAudit] = useState(null);

  useEffect(() => {
    // Fetch audits
    const unsubAudits = onSnapshot(collection(db, "audits"), (snapshot) => {
      setAudits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    // Fetch assets to audit
    const fetchAssets = async () => {
      const snap = await getDocs(collection(db, "assets"));
      setAssets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchAssets();
    
    return () => unsubAudits();
  }, []);

  const handleCreateAudit = async (e) => {
    e.preventDefault();
    if (!title || !scope) return;
    
    try {
      const auditRef = await addDoc(collection(db, "audits"), {
        title,
        scope,
        status: "In Progress",
        createdBy: userData?.name || "Unknown",
        createdAt: new Date(),
        items: assets.map(a => ({
          assetId: a.id,
          assetTag: a.tag,
          assetName: a.name,
          expectedLocation: a.location,
          status: "Pending" // Pending, Verified, Missing, Damaged
        }))
      });
      
      await addDoc(collection(db, "activityLogs"), {
        action: "Audit Cycle Started",
        entity: title,
        timestamp: new Date()
      });

      setIsAddModalOpen(false);
      setTitle("");
      setScope("");
      alert("Audit cycle started!");
    } catch (err) {
      console.error(err);
      alert("Error starting audit");
    }
  };

  const updateItemStatus = async (auditId, itemIndex, newStatus) => {
    const audit = audits.find(a => a.id === auditId);
    const newItems = [...audit.items];
    newItems[itemIndex].status = newStatus;
    
    try {
      await updateDoc(doc(db, "audits", auditId), {
        items: newItems
      });
    } catch (err) {
      console.error("Error updating audit item:", err);
    }
  };

  const closeAudit = async (audit) => {
    try {
      await updateDoc(doc(db, "audits", audit.id), {
        status: "Completed",
        completedAt: new Date()
      });
      
      // Update missing assets
      for (const item of audit.items) {
        if (item.status === "Missing") {
          await updateDoc(doc(db, "assets", item.assetId), {
            status: "Lost"
          });
        }
      }
      
      await addDoc(collection(db, "activityLogs"), {
        action: "Audit Cycle Closed",
        entity: audit.title,
        timestamp: new Date()
      });

      alert("Audit cycle closed successfully.");
      setActiveAudit(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Asset Audit</h1>
          <p className="mt-1 text-sm md:text-base text-slate-500">Conduct physical audits and resolve discrepancies.</p>
        </div>
        {(userData?.role === "Admin" || userData?.role === "Asset Manager") && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Start New Audit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        
        {/* Active Audits Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Audit Cycles</h2>
          {audits.map((audit) => {
            const isCompleted = audit.status === "Completed";
            const discrepancies = audit.items?.filter(i => i.status === "Missing" || i.status === "Damaged").length || 0;
            
            return (
              <div 
                key={audit.id} 
                onClick={() => setActiveAudit(audit)}
                className={`p-4 bg-white border rounded-xl cursor-pointer transition-colors shadow-sm ${
                  activeAudit?.id === audit.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-900">{audit.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isCompleted ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-800'}`}>
                    {audit.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">Scope: {audit.scope}</p>
                {discrepancies > 0 && (
                  <div className="flex items-center mt-3 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {discrepancies} Discrepancies
                  </div>
                )}
              </div>
            );
          })}
          {audits.length === 0 && (
            <div className="text-sm text-slate-500 italic p-4 bg-white border border-slate-200 rounded-xl">No audits found.</div>
          )}
        </div>

        {/* Active Audit Worksheet */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {activeAudit ? (
            <>
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/80">
                <div>
                  <h2 className="font-semibold text-slate-900">{activeAudit.title} Worksheet</h2>
                  <p className="text-xs text-slate-500">Mark the physical status of each asset.</p>
                </div>
                {activeAudit.status !== "Completed" && (
                  <button 
                    onClick={() => closeAudit(activeAudit)}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded text-sm font-medium hover:bg-slate-900"
                  >
                    Close Audit
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-auto p-0">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Asset</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Expected Loc</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeAudit.items?.map((item, index) => (
                      <tr key={item.assetId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {item.assetTag}
                          <div className="text-xs text-slate-500 font-normal">{item.assetName}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{item.expectedLocation}</td>
                        <td className="px-4 py-3">
                          {activeAudit.status === "Completed" ? (
                            <span className="text-sm font-medium text-slate-700">{item.status}</span>
                          ) : (
                            <select 
                              value={item.status}
                              onChange={(e) => updateItemStatus(activeAudit.id, index, e.target.value)}
                              className={`text-sm rounded border-slate-300 py-1 pl-2 pr-6 focus:ring-blue-500 focus:border-blue-500 ${
                                item.status === 'Verified' ? 'bg-green-50 text-green-700 border-green-200' :
                                item.status === 'Missing' ? 'bg-red-50 text-red-700 border-red-200' :
                                item.status === 'Damaged' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                'bg-white text-slate-600'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Verified">Verified</option>
                              <option value="Damaged">Damaged</option>
                              <option value="Missing">Missing</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              Select an audit cycle from the left to view the worksheet.
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Start Audit Cycle</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAudit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Audit Title</label>
                <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Q3 HQ Inventory Audit" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Scope / Department</label>
                <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  value={scope} onChange={e => setScope(e.target.value)} placeholder="e.g. Engineering" />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Start Audit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
