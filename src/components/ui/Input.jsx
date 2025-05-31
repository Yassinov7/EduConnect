// src/components/ui/Input.jsx
export default function Input({ label, error, icon: Icon, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-slate-900 font-bold">{label}</label>}
      <div className="flex items-center border rounded px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500 bg-white">
        {Icon && <Icon size={18} className="text-orange-500 mr-2" />}
        <input
          className="flex-1 outline-none bg-transparent font-normal"
          {...props}
        />
      </div>
      {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
    </div>
  );
}
