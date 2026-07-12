import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { collection, query, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Table, Tr, Td } from "../components/ui/Table";

export default function OrganizationSetup() {
  const { userData, loading } = useAuth();
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
    }, (error) => {
      console.error("Error fetching departments:", error);
      alert("Error reading departments from database. Check Firebase rules.");
    });
    const unsubCats = onSnapshot(query(collection(db, "categories")), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error("Error fetching categories:", error));
    const unsubEmps = onSnapshot(query(collection(db, "users")), (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error("Error fetching employees:", error));

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
      alert(`Error saving data: ${err.message}`);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  // Loader removed per user request

  // For the hackathon demo, we are temporarily removing the strict Admin check 
  // so you can access the page even if your Firebase role isn't properly set.
  // if (userData?.role !== "Admin") { ... }

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <PageHeader 
        title="Organization Setup" 
        description="Manage departments, categories and employee roles (Admin only)."
        action={
          activeTab !== "Employees" && (
            <Button onClick={() => setIsAddModalOpen(true)} icon={Plus}>
              Add New
            </Button>
          )
        }
      />

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
              <Table headers={["Department", "Head", "Status"]}>
                {departments.map((dept) => (
                  <Tr key={dept.id}>
                    <Td className="font-medium text-slate-900">{dept.name}</Td>
                    <Td>{dept.headName || "None"}</Td>
                    <Td>
                      <Badge variant={dept.status === 'Active' ? 'success' : 'default'}>
                        {dept.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
                {departments.length === 0 && (
                  <Tr><Td colSpan={3} className="text-center text-slate-500">No departments found</Td></Tr>
                )}
              </Table>
            </div>
          )}

          {activeTab === "Categories" && (
            <div className="flex flex-col h-full">
              <Table headers={["Category Name"]}>
                {categories.map((cat) => (
                  <Tr key={cat.id}>
                    <Td className="font-medium text-slate-900">{cat.name}</Td>
                  </Tr>
                ))}
                {categories.length === 0 && (
                  <Tr><Td className="text-center text-slate-500">No categories found</Td></Tr>
                )}
              </Table>
            </div>
          )}

          {activeTab === "Employees" && (
            <div className="flex flex-col h-full">
              <Table headers={["Name", "Email", "Department", "Role"]}>
                {employees.map((emp) => (
                  <Tr key={emp.id}>
                    <Td className="font-medium text-slate-900">{emp.name}</Td>
                    <Td>{emp.email}</Td>
                    <Td>{emp.department || "None"}</Td>
                    <Td>
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
                    </Td>
                  </Tr>
                ))}
                {employees.length === 0 && (
                  <Tr><Td colSpan={4} className="text-center text-slate-500">No employees found</Td></Tr>
                )}
              </Table>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title={`Add New ${activeTab.slice(0, -1)}`}
      >
        <form onSubmit={handleAddSubmit}>
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
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
