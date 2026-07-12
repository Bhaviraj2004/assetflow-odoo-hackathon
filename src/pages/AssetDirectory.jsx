import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { collection, query, onSnapshot, addDoc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Table, Tr, Td } from "../components/ui/Table";

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

  const getStatusVariant = (status) => {
    switch(status) {
      case "Available": return "success";
      case "Allocated": return "primary";
      case "Under Maintenance": return "warning";
      default: return "default";
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <PageHeader 
        title="Asset Directory" 
        description="View and manage all company assets."
        action={
          (userData?.role === "Admin" || userData?.role === "Asset Manager") && (
            <Button onClick={() => setIsAddModalOpen(true)} icon={Plus}>
              Register Asset
            </Button>
          )
        }
      />

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
          <Table headers={["Tag", "Name", "Category", "Status", "Location"]}>
            {assets.map((asset) => (
              <Tr key={asset.id} className="cursor-pointer">
                <Td className="font-medium text-slate-900">{asset.tag}</Td>
                <Td className="text-slate-900">{asset.name}</Td>
                <Td>{asset.category}</Td>
                <Td>
                  <Badge variant={getStatusVariant(asset.status)}>
                    {asset.status}
                  </Badge>
                </Td>
                <Td>{asset.location}</Td>
              </Tr>
            ))}
            {assets.length === 0 && (
              <Tr>
                <Td colSpan={5} className="text-center text-slate-500">
                  No assets registered yet.
                </Td>
              </Tr>
            )}
          </Table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Asset">
        <form onSubmit={handleRegister} className="space-y-4">
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
          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">Register</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
