export function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function Tr({ children, className = "" }) {
  return <tr className={`hover:bg-slate-50 transition-colors ${className}`}>{children}</tr>;
}

export function Td({ children, className = "", colSpan }) {
  return <td colSpan={colSpan} className={`px-6 py-4 text-sm text-slate-600 ${className}`}>{children}</td>;
}
