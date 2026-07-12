import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { ref, onValue, get, push, set, update } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";

export default function Maintenance() {
  const { userData } = useAuth();
  const columns = ["Pending", "Approved", "Technician Assigned", "In Progress", "Resolved"];
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [issue, setIssue] = useState("");

  useEffect(() => {
    // Fetch maintenance requests
    const unsub = onValue(ref(rtdb, 'maintenance'), (snapshot) => {
      const data = snapshot.val() || {};
      setRequests(Object.entries(data).map(([id, val]) => ({ id, ...val })));
    });
    
    // Fetch assets for dropdown
    const fetchAssets = async () => {
      const snap = await get(ref(rtdb, 'assets'));
      const data = snap.val() || {};
      setAssets(Object.entries(data).map(([id, val]) => ({ id, ...val })));
    };
    fetchAssets();
    
    return () => unsub();
  }, []);

  const handleRaiseRequest = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !issue) return;
    
    const asset = assets.find(a => a.id === selectedAssetId);
    
    try {
      const newReqRef = push(ref(rtdb, "maintenance"));
      await set(newReqRef, {
        assetId: selectedAssetId,
        assetTag: asset.tag,
        assetName: asset.name,
        issue,
        status: "Pending",
        raisedBy: userData?.name || "Unknown",
        createdAt: new Date().toISOString()
      });
      
      const newLogRef = push(ref(rtdb, "activityLogs"));
      await set(newLogRef, {
        action: "Maintenance Requested",
        entity: asset.tag,
        timestamp: new Date().toISOString()
      });

      setIsAddModalOpen(false);
      setSelectedAssetId("");
      setIssue("");
    } catch (err) {
      console.error(err);
      alert("Error raising request");
    }
  };

  const advanceStatus = async (req) => {
    const currentIndex = columns.indexOf(req.status);
    if (currentIndex >= columns.length - 1) return;
    
    const nextStatus = columns[currentIndex + 1];
    
    try {
      await update(ref(rtdb, `maintenance/${req.id}`), {
        status: nextStatus
      });
      
      // Update asset status based on maintenance rules
      if (nextStatus === "Approved") {
        await update(ref(rtdb, `assets/${req.assetId}`), {
          status: "Under Maintenance"
        });
      } else if (nextStatus === "Resolved") {
        await update(ref(rtdb, `assets/${req.assetId}`), {
          status: "Available"
        });
      }
      
      const logRef = push(ref(rtdb, "activityLogs"));
      await set(logRef, {
        action: `Maintenance ${nextStatus}`,
        entity: req.assetTag,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  const cardsByStatus = columns.reduce((acc, col) => {
    acc[col] = requests.filter(r => r.status === col);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <PageHeader 
        title="Maintenance Management"
        description="Track and manage asset maintenance workflows."
        action={
          <Button onClick={() => setIsAddModalOpen(true)} icon={Plus}>
            Raise Request
          </Button>
        }
      />

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {columns.map((column) => (
          <div key={column} className="flex-shrink-0 w-80 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50/80 rounded-t-xl flex justify-between items-center">
              <h3 className="font-semibold text-slate-700 text-sm tracking-wide">{column}</h3>
              <Badge variant="default" className="text-xs bg-slate-200/70 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                {cardsByStatus[column].length}
              </Badge>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
              {cardsByStatus[column].map((card) => (
                <div key={card.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="primary" className="text-[10px] uppercase tracking-wider">
                      {card.assetTag}
                    </Badge>
                    {column !== "Resolved" && (
                      <button 
                        onClick={() => advanceStatus(card)}
                        className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md font-semibold hover:bg-blue-600 hover:text-white transition-colors border border-transparent hover:border-blue-700 shadow-sm"
                      >
                        Advance
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-800 font-medium leading-relaxed">{card.issue}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-200">
                        {card.raisedBy ? card.raisedBy.substring(0, 2).toUpperCase() : "UN"}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{card.raisedBy}</p>
                    </div>
                  </div>
                </div>
              ))}
              {cardsByStatus[column].length === 0 && (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6">
                  <span className="text-xs text-slate-400 font-medium">No tickets</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Request Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Raise Maintenance Request">
        <form onSubmit={handleRaiseRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Asset</label>
            <select required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              value={selectedAssetId} onChange={e => setSelectedAssetId(e.target.value)}>
              <option value="">Select Asset</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.tag} - {a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Issue Description</label>
            <textarea required rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              value={issue} onChange={e => setIssue(e.target.value)} placeholder="Describe the problem..." />
          </div>
          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
