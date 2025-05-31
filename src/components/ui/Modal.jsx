// components/ui/Modal.jsx
import { X } from "lucide-react";

export default function Modal({ children, onClose, title, className = "" }) {
    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            dir="rtl"
            onClick={onClose}
        >
            <div
                className={`relative bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full animate-modalIn ${className}`}
                onClick={e => e.stopPropagation()}
            >
                {/* زر الإغلاق */}
                <button
                    onClick={onClose}
                    className="absolute top-3 left-3 bg-orange-100 text-orange-700 rounded-full p-2 shadow hover:bg-orange-200 transition"
                    title="إغلاق"
                >
                    <X size={22} />
                </button>
                {/* العنوان */}
                {title && (
                    <div className="font-extrabold text-xl mb-6 text-blue-950 text-center">
                        {title}
                    </div>
                )}
                {children}
            </div>
            <style>
                {`
          .animate-modalIn {
            animation: fadeInModal .23s cubic-bezier(.55,.14,.43,.9);
          }
          @keyframes fadeInModal {
            from { transform: translateY(30px) scale(.96); opacity: 0; }
            to   { transform: none; opacity: 1; }
          }
        `}
            </style>
        </div>
    );
}
