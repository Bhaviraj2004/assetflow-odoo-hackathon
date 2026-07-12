import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { ref, onValue, update, push, set } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Table, Tr, Td } from "../components/ui/Table";

export default function OrganizationSetup() {
  const { userData, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("Departments");
  const tabs = ["Departments", "Asset Category", "Employee Directory"];

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEntityData, setNewEntityData] = useState({});

  useEffect(() => {
    const deptsRef = ref(rtdb, 'departments');
    const unsubDepts = onValue(deptsRef, (snapshot) => {
      const data = snapshot.val();
      setDepartments(data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : []);
    }, (error) => {
      console.error("Error fetching departments:", error);
      alert("Error reading departments from database. Check Firebase rules.");
    });

    const catsRef = ref(rtdb, 'categories');
    const unsubCats = onValue(catsRef, (snapshot) => {
      const data = snapshot.val();
      setCategories(data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : []);
    }, (error) => console.error("Error fetching categories:", error));

    const usersRef = ref(rtdb, 'users');
    const unsubEmps = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const usersList = Object.entries(usersData).map(([id, data]) => ({ id, ...data }));
        setEmployees(usersList);
      } else {
        setEmployees([]);
      }
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
        const newRef = push(ref(rtdb, 'departments'));
        await set(newRef, { ...newEntityData, status: "Active" });
      } else if (activeTab === "Asset Category") {
        const newRef = push(ref(rtdb, 'categories'));
        await set(newRef, { ...newEntityData });
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
      await update(ref(rtdb, `users/${userId}`), { role: newRole });
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const handleDepartmentChange = async (userId, newDept) => {
    try {
      await update(ref(rtdb, `users/${userId}`), { department: newDept });
    } catch (err) {
      console.error("Error updating department:", err);
    }
  };

  if (!loading && userData?.role !== "Admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="mt-2 text-slate-600">You must be an Admin to view Organization Setup.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <PageHeader 
        title="Organization Setup" 
        description="Manage departments, categories and employee roles (Admin only)."
        action={
          activeTab !== "Employee Directory" && (
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
              <Table headers={["Department", "Head", "Parent Department", "Status"]}>
                {departments.map((dept) => (
                  <Tr key={dept.id}>
                    <Td className="font-medium text-slate-900">{dept.name}</Td>
                    <Td>{dept.headName || "None"}</Td>
                    <Td>{dept.parentDepartment || "None"}</Td>
                    <Td>
                      <Badge variant={dept.status === 'Active' ? 'success' : 'default'}>
                        {dept.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
                {departments.length === 0 && (
                  <Tr><Td colSpan={4} className="text-center text-slate-500">No departments found</Td></Tr>
                )}
              </Table>
            </div>
          )}

          {activeTab === "Asset Category" && (
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

          {activeTab === "Employee Directory" && (
            <div className="flex flex-col h-full">
              <Table headers={["Name", "Email", "Department", "Role"]}>
                {employees.map((emp) => (
                  <Tr key={emp.id}>
                    <Td className="font-medium text-slate-900">{emp.name}</Td>
                    <Td>{emp.email}</Td>
                    <Td>
                      <select 
                        className="block w-full pl-3 pr-8 py-1.5 text-sm border-slate-300 rounded-md bg-white border"
                        value={emp.department || ""}
                        onChange={(e) => handleDepartmentChange(emp.id, e.target.value)}
                      >
                        <option value="">None</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                      </select>
                    </Td>
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
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Head Name (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  onChange={(e) => setNewEntityData({...newEntityData, headName: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Parent Department (Optional)</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  onChange={(e) => setNewEntityData({...newEntityData, parentDepartment: e.target.value})}
                >
                  <option value="">None</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </>
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
