// src/pages/Courses/components/SectionFormModal.jsx
import { useState } from "react";
import { supabase } from "../../../services/supabaseClient";
import Button from "../../../components/ui/Button";
import { toast } from "sonner";

export default function SectionFormModal({ section, courseId, onClose, onSaved }) {
  const [title, setTitle] = useState(section?.title || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان القسم");
      setLoading(false);
      return;
    }
    if (section) {
      // تعديل
      const { error } = await supabase.from("sections")
        .update({ title })
        .eq("id", section.id);
      if (!error) {
        toast.success("تم تحديث القسم بنجاح");
        onSaved && onSaved();
        onClose();
      } else toast.error(error.message);
    } else {
      // إضافة
      const { error } = await supabase.from("sections")
        .insert([{ title, course_id: courseId }]);
      if (!error) {
        toast.success("تم إضافة القسم!");
        onSaved && onSaved();
        onClose();
      } else toast.error(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <form className="bg-white rounded-xl shadow-xl p-7 w-[95vw] max-w-sm flex flex-col gap-4 animate-fade-in" onSubmit={handleSubmit}>
        <div className="text-xl font-bold text-orange-500 mb-2">{section ? "تعديل قسم" : "إضافة قسم جديد"}</div>
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="عنوان القسم"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={loading}
          required
        />
        <div className="flex gap-3 mt-4">
          <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={loading}>
            {loading ? "جارٍ الحفظ..." : (section ? "حفظ التعديلات" : "إضافة")}
          </Button>
          <Button type="button" className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-900" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
}
