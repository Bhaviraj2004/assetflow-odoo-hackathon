import { useState, useEffect } from "react";
import { Plus, Search, X } from "lucide-react";
import { collection, query, onSnapshot, addDoc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function AssetDirectory() {
  const { userData } = useAuth();
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: "",
    category: "",
    location: "",
    serialNumber: "",
    condition: "New"
  });

  useEffect(() => {
    // Fetch categories for the dropdown
    const fetchCats = async () => {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map(doc => doc.data().name));
    };
    fetchCats();

    // Listen to assets collection
    const unsubAssets = onSnapshot(query(collection(db, "assets")), (snapshot) => {
      setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubAssets();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Generate Tag: AF- + 4 random digits for POC
      const tag = "AF-" + Math.floor(1000 + Math.random() * 9000);
      
      const assetData = {
        ...newAsset,
        tag,
        status: "Available",
        registeredBy: userData?.name || "Unknown",
        registeredAt: new Date()
      };
      
      await addDoc(collection(db, "assets"), assetData);
      setIsAddModalOpen(false);
      setNewAsset({ name: "", category: "", location: "", serialNumber: "", condition: "New" });
    } catch (err) {
      console.error("Failed to register asset", err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Available": return "bg-green-100 text-green-800";
      case "Allocated": return "bg-blue-100 text-blue-800";
      case "Under Maintenance": return "bg-orange-100 text-orange-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Asset Directory</h1>
          <p className="mt-1 text-sm md:text-base text-slate-500">View and manage all company assets.</p>
        </div>
        {(userData?.role === "Admin" || userData?.role === "Asset Manager") && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Register Asset
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Search by tag, serial, or QR code..."
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-white sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tag</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{asset.tag}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{asset.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{asset.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{asset.location}</td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 text-sm">No assets registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Register New Asset</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRegister} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Asset Name</label>
                <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  value={newAsset.location} onChange={e => setNewAsset({...newAsset, location: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number (Optional)</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  value={newAsset.serialNumber} onChange={e => setNewAsset({...newAsset, serialNumber: e.target.value})} />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
