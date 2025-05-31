// src/components/ui/DeleteConfirmation.jsx
import { AlertTriangle } from "lucide-react";

export default function DeleteConfirmation({ title, message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[94vw] max-w-md flex flex-col gap-4 items-center animate-fade-in">
        <AlertTriangle size={48} className="text-red-500 mb-1" />
        <div className="text-xl font-bold text-red-600 mb-1">{title}</div>
        <div className="text-gray-700 mb-3 text-center">{message}</div>
        <div className="flex gap-4 mt-2 w-full">
          <button
            className="flex-1 px-5 py-2 rounded-lg font-bold bg-red-500 hover:bg-red-600 text-white transition"
            onClick={onConfirm}
          >نعم، احذف</button>
          <button
            className="flex-1 px-5 py-2 rounded-lg font-bold bg-gray-100 hover:bg-gray-200 text-slate-900 transition"
            onClick={onCancel}
          >إلغاء</button>
        </div>
      </div>
    </div>
  );
}
