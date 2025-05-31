// src/pages/Courses/components/QuizFormModal.jsx
import { useState } from "react";
import { supabase } from "../../../services/supabaseClient";
import Button from "../../../components/ui/Button";
import { toast } from "sonner";
// لو عندك QuizQuestionsManager.jsx ضيفه هنا

export default function QuizFormModal({ quiz, sectionId, onClose, onSaved }) {
  const [title, setTitle] = useState(quiz?.title || "");
  const [loading, setLoading] = useState(false);
  const [quizId, setQuizId] = useState(quiz?.id || null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان الاختبار");
      setLoading(false);
      return;
    }
    if (quiz) {
      // تعديل
      const { error } = await supabase.from("quizzes")
        .update({ title })
        .eq("id", quiz.id);
      if (!error) {
        toast.success("تم تحديث الاختبار");
        onSaved && onSaved();
        onClose();
      } else toast.error(error.message);
    } else {
      // إضافة
      const { data, error } = await supabase.from("quizzes")
        .insert([{ title, section_id: sectionId }])
        .select()
        .single();
      if (!error) {
        toast.success("تم إضافة الاختبار! أضف الأسئلة الآن.");
        setQuizId(data.id);
        onSaved && onSaved();
        onClose();
        // هنا يمكنك فتح إدارة الأسئلة
      } else toast.error(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <form className="bg-white rounded-xl shadow-xl p-7 w-[95vw] max-w-sm flex flex-col gap-4 animate-fade-in" onSubmit={handleSubmit}>
        <div className="text-xl font-bold text-orange-500 mb-2">{quiz ? "تعديل اختبار" : "إضافة اختبار"}</div>
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="عنوان الاختبار"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={loading}
          required
        />
        <div className="flex gap-3 mt-4">
          <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={loading}>
            {loading ? "جارٍ الحفظ..." : (quiz ? "حفظ التعديلات" : "إضافة")}
          </Button>
          <Button type="button" className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-900" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
        </div>
        {/* يمكنك عرض QuizQuestionsManager هنا مباشرة عند نجاح الإضافة */}
      </form>
    </div>
  );
}
