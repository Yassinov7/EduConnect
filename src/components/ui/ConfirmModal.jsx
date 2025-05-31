// src/components/ui/ConfirmModal.jsx
export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "تأكيد",
  confirmColor = "orange",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xs flex flex-col gap-5 items-center animate-fadeIn">
        <div className="text-2xl font-bold text-orange-500">{title}</div>
        <div className="text-gray-700 text-center">{description}</div>
        <div className="flex gap-3 w-full mt-3">
          <button
            className={`flex-1 px-4 py-2 rounded-xl font-bold shadow transition ${
              confirmColor === "red"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            className="flex-1 px-4 py-2 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition shadow"
            onClick={onCancel}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
