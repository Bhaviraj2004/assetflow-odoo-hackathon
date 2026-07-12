import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Shield, 
  Edit3, 
  ArrowLeft 
} from "lucide-react";

export default function Profile() {
  const { userData, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const safeUserData = userData || {};
  const displayName = safeUserData.name || user?.displayName || "User";
  const displayEmail = safeUserData.email || user?.email || "";
  const profilePic = safeUserData.profilePicture || user?.photoURL || "";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
            <p className="text-sm text-slate-500">View your personal information and account details</p>
          </div>
        </div>
        <Link
          to="/edit-profile"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Cover Photo / Header background */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-16 mb-8">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-md flex items-center justify-center">
              {profilePic ? (
                <img src={profilePic} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                  <User className="w-16 h-16 text-blue-500" />
                </div>
              )}
            </div>
            
            <div className="mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                {safeUserData.status || "Active"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="col-span-1 md:col-span-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">{displayName}</h2>
              <p className="text-slate-500 font-medium mb-6">{safeUserData.role || "User"}</p>

              {safeUserData.bio && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">About</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{safeUserData.bio}</p>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="col-span-1 md:col-span-2 space-y-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                Contact & Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-0.5">Email Address</p>
                    <p className="text-sm text-slate-900">{displayEmail}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-0.5">Phone Number</p>
                    <p className="text-sm text-slate-900">{safeUserData.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-0.5">Department</p>
                    <p className="text-sm text-slate-900">{safeUserData.department || "None"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-0.5">Role Level</p>
                    <p className="text-sm text-slate-900">{safeUserData.role || "User"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
