import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Layout from './components/Layout'
import { useAuth } from './context/AuthContext'

// Placeholders for all screens to establish routing
import Dashboard from './pages/Dashboard'
import OrganizationSetup from './pages/OrganizationSetup'
import AssetDirectory from './pages/AssetDirectory'
import AssetAllocation from './pages/AssetAllocation'
import ResourceBooking from './pages/ResourceBooking'
import Maintenance from './pages/Maintenance'
import Audit from './pages/Audit'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/setup" element={<OrganizationSetup />} />
        <Route path="/assets" element={<AssetDirectory />} />
        <Route path="/allocation" element={<AssetAllocation />} />
        <Route path="/booking" element={<ResourceBooking />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
    </Routes>
  )
}

export default App
