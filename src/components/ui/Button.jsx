export function Button({ children, onClick, type = "button", variant = "primary", className = "", icon: Icon }) {
  const baseClasses = "flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };

  return (
    <button type={type} onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`}>
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
}
