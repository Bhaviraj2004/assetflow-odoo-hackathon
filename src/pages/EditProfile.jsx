import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ref, update } from "firebase/database";
import { rtdb as db } from "../lib/firebase";
import { 
  User, 
  Camera, 
  Loader2, 
  ArrowLeft,
  Save
} from "lucide-react";

// Replace these with your actual Cloudinary credentials or use environment variables
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "docs_upload_example_us_preset";

export default function EditProfile() {
  const { userData, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: "",
    department: "",
    profilePicture: ""
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userData || user) {
      const safeUserData = userData || {};
      setFormData({
        name: safeUserData.name || user?.displayName || "",
        phone: safeUserData.phone || "",
        bio: safeUserData.bio || "",
        department: safeUserData.department || "",
        profilePicture: safeUserData.profilePicture || user?.photoURL || ""
      });
    }
  }, [userData, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Compress image using HTML5 Canvas
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");
      
      // 1. Compress Image
      const compressedDataUrl = await compressImage(file);
      
      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", compressedDataUrl);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, profilePicture: data.secure_url }));
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      // Fallback for demo purposes if Cloudinary is not configured correctly
      alert("Note: Cloudinary upload failed. Please configure your Cloudinary credentials in EditProfile.jsx. Using local preview for now.");
      
      const localDataUrl = await compressImage(file);
      setFormData((prev) => ({ ...prev, profilePicture: localDataUrl }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError("");

      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        department: formData.department,
        profilePicture: formData.profilePicture,
        email: user.email // Make sure email is saved if it wasn't there
      });

      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const displayEmail = userData?.email || user?.email || "";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/profile" className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Profile</h1>
          <p className="text-sm text-slate-500">Update your personal information</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="mb-8 flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-md flex items-center justify-center">
                {uploadingImage ? (
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                ) : formData.profilePicture ? (
                  <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-slate-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="text-center sm:text-left mt-2">
              <h3 className="text-lg font-semibold text-slate-900">Profile Picture</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                JPG, GIF or PNG. Image will be automatically compressed before uploading via Cloudinary.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address <span className="text-slate-400 text-xs font-normal">(Read Only)</span>
              </label>
              <input
                type="email"
                id="email"
                value={displayEmail}
                disabled
                className="w-full px-4 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Engineering, IT"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
                Bio / About
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a little bit about yourself..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              to="/profile"
              className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
