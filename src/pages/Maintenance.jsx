import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { collection, query, onSnapshot, addDoc, updateDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

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
    const unsub = onSnapshot(collection(db, "maintenance"), (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    // Fetch assets for dropdown
    const fetchAssets = async () => {
      const snap = await getDocs(collection(db, "assets"));
      setAssets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchAssets();
    
    return () => unsub();
  }, []);

  const handleRaiseRequest = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !issue) return;
    
    const asset = assets.find(a => a.id === selectedAssetId);
    
    try {
      await addDoc(collection(db, "maintenance"), {
        assetId: selectedAssetId,
        assetTag: asset.tag,
        assetName: asset.name,
        issue,
        status: "Pending",
        raisedBy: userData?.name || "Unknown",
        createdAt: new Date()
      });
      
      await addDoc(collection(db, "activityLogs"), {
        action: "Maintenance Requested",
        entity: asset.tag,
        timestamp: new Date()
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
      await updateDoc(doc(db, "maintenance", req.id), {
        status: nextStatus
      });
      
      // Update asset status based on maintenance rules
      if (nextStatus === "Approved") {
        await updateDoc(doc(db, "assets", req.assetId), {
          status: "Under Maintenance"
        });
      } else if (nextStatus === "Resolved") {
        await updateDoc(doc(db, "assets", req.assetId), {
          status: "Available"
        });
      }
      
      await addDoc(collection(db, "activityLogs"), {
        action: `Maintenance ${nextStatus}`,
        entity: req.assetTag,
        timestamp: new Date()
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Maintenance Management</h1>
          <p className="mt-1 text-sm md:text-base text-slate-500">Track and manage asset maintenance workflows.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Raise Request
        </button>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column} className="flex-shrink-0 w-72 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200">
            <div className="p-3 border-b border-slate-200 bg-slate-50/80 rounded-t-xl flex justify-between items-center">
              <h3 className="font-semibold text-slate-700 text-sm">{column}</h3>
              <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{cardsByStatus[column].length}</span>
            </div>
            <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto">
              {cardsByStatus[column].map((card) => (
                <div key={card.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                      {card.assetTag}
                    </span>
                    {column !== "Resolved" && (
                      <button 
                        onClick={() => advanceStatus(card)}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                      >
                        Advance
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-800 font-medium">{card.issue}</p>
                  <p className="text-xs text-slate-400 mt-2">By: {card.raisedBy}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-slate-500 italic bg-blue-50/50 p-3 rounded-lg border border-blue-100 inline-block self-start">
        Note: Advancing a card to Approved moves the asset to "Under Maintenance". Advancing to Resolved returns it to "Available".
      </div>
      
      {/* Add Request Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Raise Maintenance Request</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRaiseRequest} className="p-6 space-y-4">
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
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
