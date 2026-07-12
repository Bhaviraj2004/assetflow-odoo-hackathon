import { useState, useEffect } from "react";
import { Plus, AlertTriangle, CheckCircle, XCircle, FileText } from "lucide-react";
import { ref, onValue, get, push, set, update } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Table, Tr, Td } from "../components/ui/Table";

export default function Audit() {
  const { userData } = useAuth();
  const [audits, setAudits] = useState([]);
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("");
  
  const [activeAudit, setActiveAudit] = useState(null);

  useEffect(() => {
    // Fetch audits
    const unsubAudits = onValue(ref(rtdb, 'audits'), (snapshot) => {
      const data = snapshot.val() || {};
      setAudits(Object.entries(data).map(([id, val]) => ({ id, ...val })));
    });
    
    // Fetch assets to audit
    const fetchAssets = async () => {
      const snap = await get(ref(rtdb, 'assets'));
      const data = snap.val() || {};
      setAssets(Object.entries(data).map(([id, val]) => ({ id, ...val })));
    };
    fetchAssets();
    
    // Fetch categories for scope selection
    const fetchCategories = async () => {
      const snap = await get(ref(rtdb, 'categories'));
      const data = snap.val() || {};
      setCategories(Object.values(data).map(cat => cat.name));
    };
    fetchCategories();
    
    return () => unsubAudits();
  }, []);

  const handleCreateAudit = async (e) => {
    e.preventDefault();
    if (!title || !scope) return;
    
    try {
      const targetAssets = scope === "All" ? assets : assets.filter(a => a.category === scope);
      if (targetAssets.length === 0) {
        alert("No assets found for this category.");
        return;
      }
      
      const newAuditRef = push(ref(rtdb, "audits"));
      await set(newAuditRef, {
        title,
        scope,
        status: "In Progress",
        createdBy: userData?.name || "Unknown",
        createdAt: new Date().toISOString(),
        items: targetAssets.map(a => ({
          assetId: a.id,
          assetTag: a.tag,
          assetName: a.name,
          expectedLocation: a.location,
          status: "Pending" // Pending, Verified, Missing, Damaged
        }))
      });
      
      const newLogRef = push(ref(rtdb, "activityLogs"));
      await set(newLogRef, {
        action: "Audit Cycle Started",
        entity: title,
        timestamp: new Date().toISOString()
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
      await update(ref(rtdb, `audits/${auditId}`), {
        items: newItems
      });
      
      // Update active audit state immediately so UI feels responsive
      if (activeAudit && activeAudit.id === auditId) {
        setActiveAudit({ ...activeAudit, items: newItems });
      }
    } catch (err) {
      console.error("Error updating audit item:", err);
    }
  };

  const closeAudit = async (audit) => {
    try {
      await update(ref(rtdb, `audits/${audit.id}`), {
        status: "Completed",
        completedAt: new Date().toISOString()
      });
      
      // Update missing assets in the main assets collection
      for (const item of audit.items) {
        if (item.status === "Missing") {
          await update(ref(rtdb, `assets/${item.assetId}`), {
            status: "Lost"
          });
        } else if (item.status === "Damaged") {
          await update(ref(rtdb, `assets/${item.assetId}`), {
            status: "Maintenance"
          });
        }
      }
      
      const logRef = push(ref(rtdb, "activityLogs"));
      await set(logRef, {
        action: "Audit Cycle Closed",
        entity: audit.title,
        timestamp: new Date().toISOString()
      });

      alert("Audit cycle closed successfully.");
      setActiveAudit(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <PageHeader 
        title="Asset Audit"
        description="Conduct physical audits and resolve discrepancies."
        action={
          (userData?.role === "Admin" || userData?.role === "Asset Manager") && (
            <Button onClick={() => setIsAddModalOpen(true)} icon={Plus}>
              Start New Audit
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Active Audits Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Audit Cycles</h2>
          {audits.map((audit) => {
            const isCompleted = audit.status === "Completed";
            const discrepancies = audit.items?.filter(i => i.status === "Missing" || i.status === "Damaged").length || 0;
            
            return (
              <div 
                key={audit.id} 
                onClick={() => setActiveAudit(audit)}
                className={`p-4 bg-white border rounded-xl cursor-pointer transition-all shadow-sm ${
                  activeAudit?.id === audit.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-900">{audit.title}</h3>
                  <Badge variant={isCompleted ? 'default' : 'primary'}>
                    {audit.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mb-2">Scope: {audit.scope}</p>
                {discrepancies > 0 && (
                  <div className="flex items-center mt-3 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {discrepancies} Discrepancies
                  </div>
                )}
              </div>
            );
          })}
          {audits.length === 0 && (
            <div className="text-sm text-slate-500 italic p-6 bg-white border border-slate-200 rounded-xl text-center">
              No audit cycles found.
            </div>
          )}
        </div>

        {/* Active Audit Worksheet */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {activeAudit ? (
            <>
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="font-semibold text-slate-900 text-lg">{activeAudit.title} Worksheet</h2>
                  <p className="text-xs text-slate-500 mt-1">Mark the physical status of each asset below.</p>
                </div>
                {activeAudit.status !== "Completed" && (
                  <Button variant="secondary" onClick={() => closeAudit(activeAudit)}>
                    Close Audit
                  </Button>
                )}
              </div>
              <div className="flex-1 overflow-auto">
                {activeAudit.status === "Completed" && (
                  <div className="m-6 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Official Audit Report</h3>
                        <p className="text-sm text-slate-500">Generated on {new Date(activeAudit.completedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                      <div className="bg-white p-4 rounded-lg border border-slate-200 text-center shadow-sm">
                        <div className="text-2xl font-bold text-slate-700">{activeAudit.items?.length || 0}</div>
                        <div className="text-xs text-slate-500 font-medium uppercase mt-1">Total Scanned</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center shadow-sm">
                        <div className="text-2xl font-bold text-green-700">
                          {activeAudit.items?.filter(i => i.status === 'Verified').length || 0}
                        </div>
                        <div className="text-xs text-green-600 font-medium uppercase mt-1">Verified</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center shadow-sm">
                        <div className="text-2xl font-bold text-red-700">
                          {activeAudit.items?.filter(i => i.status === 'Missing').length || 0}
                        </div>
                        <div className="text-xs text-red-600 font-medium uppercase mt-1">Missing</div>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-center shadow-sm">
                        <div className="text-2xl font-bold text-amber-700">
                          {activeAudit.items?.filter(i => i.status === 'Damaged').length || 0}
                        </div>
                        <div className="text-xs text-amber-600 font-medium uppercase mt-1">Damaged</div>
                      </div>
                    </div>
                    
                    {activeAudit.items?.some(i => i.status === 'Missing' || i.status === 'Damaged') && (
                      <div className="bg-white border border-red-200 rounded-lg overflow-hidden">
                        <div className="bg-red-50 p-3 border-b border-red-200 font-semibold text-red-800 text-sm flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" /> Discrepancies Found
                        </div>
                        <div className="p-0">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                              <tr><th className="px-4 py-2">Asset</th><th className="px-4 py-2">Status Action Taken</th></tr>
                            </thead>
                            <tbody>
                              {activeAudit.items.filter(i => i.status === 'Missing' || i.status === 'Damaged').map(item => (
                                <tr key={item.assetId} className="border-t border-slate-100">
                                  <td className="px-4 py-3 font-medium text-slate-700">{item.assetTag} - {item.assetName}</td>
                                  <td className="px-4 py-3">
                                    {item.status === 'Missing' ? (
                                      <span className="text-red-600 font-medium text-xs">Marked as LOST in DB</span>
                                    ) : (
                                      <span className="text-amber-600 font-medium text-xs">Moved to MAINTENANCE in DB</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Table headers={["Asset", "Expected Location", "Status"]}>
                  {activeAudit.items?.map((item, index) => (
                    <Tr key={item.assetId}>
                      <Td>
                        <div className="font-medium text-slate-900">{item.assetTag}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.assetName}</div>
                      </Td>
                      <Td>{item.expectedLocation}</Td>
                      <Td>
                        {activeAudit.status === "Completed" ? (
                          <Badge variant={item.status === 'Verified' ? 'success' : item.status === 'Missing' ? 'danger' : item.status === 'Damaged' ? 'warning' : 'default'}>
                            {item.status}
                          </Badge>
                        ) : (
                          <select 
                            value={item.status}
                            onChange={(e) => updateItemStatus(activeAudit.id, index, e.target.value)}
                            className={`text-sm rounded-lg border-slate-300 py-1.5 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500 border outline-none ${
                              item.status === 'Verified' ? 'bg-green-50 text-green-700 border-green-200' :
                              item.status === 'Missing' ? 'bg-red-50 text-red-700 border-red-200' :
                              item.status === 'Damaged' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-white text-slate-600'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Verified">Verified</option>
                            <option value="Damaged">Damaged</option>
                            <option value="Missing">Missing</option>
                          </select>
                        )}
                      </Td>
                    </Tr>
                  ))}
                  {(!activeAudit.items || activeAudit.items.length === 0) && (
                    <Tr>
                      <Td colSpan={3} className="text-center text-slate-500">
                        No assets found in this audit scope.
                      </Td>
                    </Tr>
                  )}
                </Table>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <AlertTriangle className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-900">No Worksheet Selected</p>
              <p className="text-sm mt-1">Select an audit cycle from the left panel to begin verification.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Start Audit Cycle">
        <form onSubmit={handleCreateAudit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Audit Title</label>
            <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Q3 HQ Inventory Audit" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Scope / Category</label>
            <select required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              value={scope} onChange={e => setScope(e.target.value)}>
              <option value="">Select Category</option>
              <option value="All">All Assets</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">Start Audit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
