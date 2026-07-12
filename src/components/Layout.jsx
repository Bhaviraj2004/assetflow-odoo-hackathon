import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  PackageSearch,
  ArrowRightLeft,
  CalendarDays,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell
} from "lucide-react";

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Organization Setup", path: "/setup", icon: Settings },
    { name: "Assets", path: "/assets", icon: PackageSearch },
    { name: "Allocation & Transfer", path: "/allocation", icon: ArrowRightLeft },
    { name: "Resource Booking", path: "/booking", icon: CalendarDays },
    { name: "Maintenance", path: "/maintenance", icon: Wrench },
    { name: "Audit", path: "/audit", icon: ClipboardCheck },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Notifications", path: "/notifications", icon: Bell },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AssetFlow</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
