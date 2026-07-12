import { useState, useEffect } from "react";
import { Plus, Search, X } from "lucide-react";
import { collection, query, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function OrganizationSetup() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState("Departments");
  const tabs = ["Departments", "Categories", "Employees"];

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEntityData, setNewEntityData] = useState({});

  useEffect(() => {
    const unsubDepts = onSnapshot(query(collection(db, "departments")), (snapshot) => {
      setDepartments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubCats = onSnapshot(query(collection(db, "categories")), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubEmps = onSnapshot(query(collection(db, "users")), (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubDepts();
      unsubCats();
      unsubEmps();
    };
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === "Departments") {
        await addDoc(collection(db, "departments"), { ...newEntityData, status: "Active" });
      } else if (activeTab === "Categories") {
        await addDoc(collection(db, "categories"), { ...newEntityData });
      }
      setIsAddModalOpen(false);
      setNewEntityData({});
    } catch (err) {
      console.error("Error adding entity:", err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  if (userData?.role !== "Admin") {
    return <div className="p-8 text-center text-red-500">Access Denied. Admins only.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Organization Setup</h1>
          <p className="mt-1 text-sm md:text-base text-slate-500">Manage departments, categories and employee roles (Admin only).</p>
        </div>
        {activeTab !== "Employees" && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-slate-200 flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col overflow-hidden">
          {activeTab === "Departments" && (
            <div className="flex flex-col h-full">
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Head</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {departments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{dept.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{dept.headName || "None"}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${dept.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                            {dept.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {departments.length === 0 && (
                      <tr><td colSpan="3" className="px-6 py-4 text-center text-slate-500 text-sm">No departments found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "Categories" && (
            <div className="flex flex-col h-full">
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category Name</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{cat.name}</td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr><td className="px-6 py-4 text-center text-slate-500 text-sm">No categories found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "Employees" && (
            <div className="flex flex-col h-full">
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{emp.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{emp.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{emp.department || "None"}</td>
                        <td className="px-6 py-4 text-sm">
                          <select 
                            className="block w-full pl-3 pr-8 py-1.5 text-sm border-slate-300 rounded-md bg-white border"
                            value={emp.role || "Employee"}
                            onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                          >
                            <option value="Employee">Employee</option>
                            <option value="Department Head">Department Head</option>
                            <option value="Asset Manager">Asset Manager</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {employees.length === 0 && (
                      <tr><td colSpan="4" className="px-6 py-4 text-center text-slate-500 text-sm">No employees found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Add New {activeTab.slice(0, -1)}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  onChange={(e) => setNewEntityData({...newEntityData, name: e.target.value})}
                />
              </div>
              {activeTab === "Departments" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Head Name (Optional)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    onChange={(e) => setNewEntityData({...newEntityData, headName: e.target.value})}
                  />
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
