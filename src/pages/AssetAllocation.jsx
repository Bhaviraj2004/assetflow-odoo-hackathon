import { useState, useEffect } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { collection, query, onSnapshot, getDocs, addDoc, updateDoc, doc, where, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function AssetAllocation() {
  const { userData } = useAuth();
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [selectedAssetData, setSelectedAssetData] = useState(null);
  
  const [activeAllocation, setActiveAllocation] = useState(null);
  const [allocationHistory, setAllocationHistory] = useState([]);

  const [toEmployee, setToEmployee] = useState("");
  const [reason, setReason] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");

  useEffect(() => {
    // Fetch assets
    const unsubAssets = onSnapshot(collection(db, "assets"), (snapshot) => {
      setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    // Fetch employees
    const fetchEmployees = async () => {
      const snap = await getDocs(query(collection(db, "users")));
      setEmployees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchEmployees();

    return () => unsubAssets();
  }, []);

  useEffect(() => {
    if (selectedAssetId) {
      const asset = assets.find(a => a.id === selectedAssetId);
      setSelectedAssetData(asset);
      
      // Fetch active allocation if any
      const fetchAllocations = async () => {
        const allocQuery = query(collection(db, "allocations"), where("assetId", "==", selectedAssetId));
        const allocSnap = await getDocs(allocQuery);
        
        let active = null;
        const history = [];
        allocSnap.forEach(doc => {
          const data = { id: doc.id, ...doc.data() };
          history.push(data);
          if (data.status === "Allocated") {
            active = data;
          }
        });
        
        // Sort history by date descending manually since we can't do complex index here easily
        history.sort((a, b) => b.allocatedAt?.toMillis() - a.allocatedAt?.toMillis());
        
        setActiveAllocation(active);
        setAllocationHistory(history);
      };
      
      fetchAllocations();
    } else {
      setSelectedAssetData(null);
      setActiveAllocation(null);
      setAllocationHistory([]);
    }
  }, [selectedAssetId, assets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !toEmployee) return;

    try {
      const isTransfer = !!activeAllocation;
      
      const toEmpData = employees.find(e => e.id === toEmployee);
      
      const newAllocData = {
        assetId: selectedAssetId,
        assetTag: selectedAssetData.tag,
        assetName: selectedAssetData.name,
        assignedToId: toEmployee,
        assignedToName: toEmpData.name,
        reason,
        expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
        status: isTransfer ? "Transfer Requested" : "Allocated",
        requestedBy: userData?.name || "Unknown",
        allocatedAt: new Date()
      };

      await addDoc(collection(db, "allocations"), newAllocData);
      
      // Update asset status if direct allocation
      if (!isTransfer) {
        await updateDoc(doc(db, "assets", selectedAssetId), {
          status: "Allocated"
        });
      }

      // Log activity
      await addDoc(collection(db, "activityLogs"), {
        action: isTransfer ? "Transfer Requested" : "Allocated",
        entity: `${selectedAssetData.tag} to ${toEmpData.name}`,
        timestamp: new Date()
      });

      // Reset form
      setSelectedAssetId("");
      setToEmployee("");
      setReason("");
      setExpectedReturnDate("");
      alert(isTransfer ? "Transfer request submitted!" : "Asset allocated successfully!");

    } catch (err) {
      console.error("Error allocating asset:", err);
      alert("Error processing request");
    }
  };

  const showConflict = !!activeAllocation;

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Allocation & Transfer</h1>
        <p className="mt-1 text-sm md:text-base text-slate-500">Assign assets to employees or request transfers.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="p-8 flex-1 overflow-y-auto">
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Asset</label>
            <select 
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="block w-full max-w-md pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-slate-50"
            >
              <option value="">Choose an asset...</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.tag} - {asset.name} ({asset.status})
                </option>
              ))}
            </select>
          </div>

          {showConflict && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Already allocated to {activeAllocation.assignedToName}
                </h3>
                <p className="mt-1 text-sm text-red-700">Direct re-allocation is blocked. Submit a transfer request below.</p>
              </div>
            </div>
          )}

          {selectedAssetId && (
            <form className="mb-8" onSubmit={handleSubmit}>
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                {showConflict ? "Transfer Request" : "New Allocation"}
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">From</label>
                    <input 
                      type="text" 
                      disabled
                      value={showConflict ? activeAllocation.assignedToName : "Inventory"}
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-100 text-slate-500"
                    />
                  </div>
                  <div className="pt-6">
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">To</label>
                    <select 
                      required
                      value={toEmployee}
                      onChange={(e) => setToEmployee(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-white"
                    >
                      <option value="">Select Employee...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.department || "No Dept"})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Expected Return Date (Optional)</label>
                    <input 
                      type="date"
                      value={expectedReturnDate}
                      onChange={(e) => setExpectedReturnDate(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                  <div className="flex-1"></div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
                  <textarea 
                    rows={4}
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="Enter reason for allocation/transfer..."
                  ></textarea>
                </div>

                <div>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    {showConflict ? "Submit Transfer Request" : "Allocate Asset"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {selectedAssetId && allocationHistory.length > 0 && (
            <div className="mt-12 border-t border-slate-200 pt-8">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Allocation History</h3>
              <div className="space-y-4">
                {allocationHistory.map((historyItem, i) => (
                  <div className="flex" key={historyItem.id}>
                    <div className="flex flex-col items-center mr-4">
                      <div className={`h-2 w-2 rounded-full mt-1.5 ${historyItem.status === 'Allocated' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                      {i !== allocationHistory.length - 1 && <div className="h-full w-px bg-slate-200 my-1"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm text-slate-900 font-medium">
                        {historyItem.allocatedAt ? new Date(historyItem.allocatedAt.toDate()).toLocaleDateString() : 'Unknown Date'} 
                        - {historyItem.status} to {historyItem.assignedToName}
                      </p>
                      {historyItem.reason && <p className="text-xs text-slate-500 mt-1">Reason: {historyItem.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
