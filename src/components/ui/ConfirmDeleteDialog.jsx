import { Trash2 } from "lucide-react";

export default function ConfirmDeleteDialog({ open, onCancel, onConfirm, message = "هل أنت متأكد أنك تريد حذف هذا العنصر؟", loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-xs flex flex-col gap-4 items-center animate-fade-in">
        <div className="bg-red-100 rounded-full p-3 mb-2"><Trash2 size={34} className="text-red-500" /></div>
        <div className="font-bold text-lg text-red-600 mb-1">تأكيد الحذف</div>
        <div className="text-gray-700 text-center">{message}</div>
        <div className="flex gap-3 mt-2 w-full">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-800 rounded-xl font-bold py-2 shadow transition"
            disabled={loading}
            type="button"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold py-2 shadow transition"
            disabled={loading}
            type="button"
          >
            {loading ? "جاري الحذف..." : "حذف"}
          </button>
        </div>
      </div>
    </div>
  );
}
