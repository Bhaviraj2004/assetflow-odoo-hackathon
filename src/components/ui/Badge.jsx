export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-slate-100 text-slate-800",
    success: "bg-green-100 text-green-800",
    primary: "bg-blue-100 text-blue-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-indigo-100 text-indigo-800",
  };
  
  return (
    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
