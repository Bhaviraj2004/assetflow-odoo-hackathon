import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";

export function ImageUpload({ onUpload, defaultImage = null, label = "Upload Image" }) {
  const [image, setImage] = useState(defaultImage);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "assetflow_preset"); 

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dvzwlv6vr/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImage(data.secure_url);
        onUpload(data.secure_url);
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      setError("Failed to upload image. Make sure the unsigned preset 'assetflow_preset' exists.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setImage(null);
    onUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      
      {image ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm inline-block group mt-1">
          <img src={image} alt="Uploaded preview" className="h-32 w-auto object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 bg-white/90 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full mt-1 border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors"
        >
          {isUploading ? (
            <div className="flex flex-col items-center py-2">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-2" />
              <span className="text-sm text-slate-500 font-medium">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-500 py-2">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-sm font-medium text-slate-700">Click to upload</span>
            </div>
          )}
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
      
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
