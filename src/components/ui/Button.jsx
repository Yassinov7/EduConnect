// src/components/ui/Button.jsx
export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={
        "bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg shadow transition " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
