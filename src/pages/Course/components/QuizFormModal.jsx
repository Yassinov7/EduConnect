import { useState } from "react";
import Button from "../../../components/ui/Button";
import { toast } from "sonner";
import { useCourseContent } from "../../../contexts/CourseContentContext";
// لو عندك QuizQuestionsManager.jsx ضيفه هنا

export default function QuizFormModal({ quiz, sectionId, onClose, onSaved }) {
  const [title, setTitle] = useState(quiz?.title || "");
  const [loading, setLoading] = useState(false);
  const { addQuiz, updateQuiz } = useCourseContent();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان الاختبار");
      setLoading(false);
      return;
    }
    let success = false;
    if (quiz) {
      // تعديل
      success = await updateQuiz(quiz.id, sectionId, title);
      if (success) toast.success("تم تحديث الاختبار");
    } else {
      // إضافة
      success = await addQuiz(sectionId, title);
      if (success) toast.success("تم إضافة الاختبار! أضف الأسئلة الآن.");
    }
    setLoading(false);
    if (success) {
      onSaved && onSaved();
      onClose();
    }
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
