import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Settings,
  PackageSearch,
  ArrowRightLeft,
  CalendarDays,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  LogOut,
  User,
  ChevronDown
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Organization Setup", path: "/setup", icon: Settings, adminOnly: true },
    { name: "Assets", path: "/assets", icon: PackageSearch },
    { name: "Allocation & Transfer", path: "/allocation", icon: ArrowRightLeft },
    { name: "Resource Booking", path: "/booking", icon: CalendarDays },
    { name: "Maintenance", path: "/maintenance", icon: Wrench },
    { name: "Audit", path: "/audit", icon: ClipboardCheck },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Notifications", path: "/notifications", icon: Bell },
  ];

  const visibleNavItems = navItems.filter(item => {
    if (item.adminOnly && userData?.role !== "Admin") {
      return false;
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AssetFlow</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${
                    isActive ? "text-blue-700" : "text-slate-400 group-hover:text-slate-500"
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors group"
          >
            <LogOut className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-slate-400 group-hover:text-red-500" />
            <span className="truncate">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-6 flex-shrink-0 z-10">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 hover:bg-slate-50 p-2 rounded-lg transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-slate-200">
                {userData?.profilePicture ? (
                  <img src={userData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-700">{userData?.name || "User"}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  View Profile
                </Link>
                <Link
                  to="/edit-profile"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Edit Profile
                </Link>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
