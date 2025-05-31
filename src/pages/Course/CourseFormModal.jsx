// src/pages/Courses/CourseFormModal.jsx
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { toast } from "sonner";

export default function CourseFormModal({ course, categories, allCourses, onClose, onSaved }) {
  const { user } = useAuth();
  const [title, setTitle] = useState(course?.title || "");
  const [description, setDescription] = useState(course?.description || "");
  const [categoryId, setCategoryId] = useState(course?.category_id || "");
  const [coverUrl, setCoverUrl] = useState(course?.cover_url || "");
  const [prerequisiteId, setPrerequisiteId] = useState(course?.prerequisite_id || "");
  const [loading, setLoading] = useState(false);

  // رفع صورة الغلاف (اختياري)
  async function handleCoverUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `cover-${user.id}-${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from("covers").upload(fileName, file);
    if (error) toast.error("فشل رفع الغلاف");
    else setCoverUrl(supabase.storage.from("covers").getPublicUrl(fileName).data.publicUrl);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (!title) {
      toast.error("يرجى كتابة عنوان الدورة");
      setLoading(false);
      return;
    }

    const payload = {
      title,
      description,
      category_id: categoryId || null,
      cover_url: coverUrl || null,
      prerequisite_id: prerequisiteId || null,
      teacher_id: course ? course.teacher_id : user.id, // الصحيح هنا!
    };

    if (course) {
      // تعديل دورة
      const { error } = await supabase.from("courses").update(payload).eq("id", course.id);
      if (!error) {
        toast.success("تم تعديل الدورة بنجاح");
        onSaved();
      } else {
        toast.error(error.message);
      }
    } else {
      // إضافة دورة جديدة
      const { error } = await supabase.from("courses").insert([payload]);
      if (!error) {
        toast.success("تم إضافة الدورة!");
        onSaved();
      } else {
        toast.error(error.message);
      }
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <form
        className="bg-white rounded-xl shadow-xl p-7 w-[95vw] max-w-lg flex flex-col gap-4 items-center animate-fade-in"
        onSubmit={handleSubmit}
      >
        <div className="text-xl font-bold text-orange-500 mb-2">{course ? "تعديل دورة" : "إضافة دورة"}</div>
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="عنوان الدورة"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2"
          placeholder="وصف الدورة (اختياري)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          disabled={loading}
        >
          <option value="">بدون تصنيف</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* اختيار متطلب (prerequisite) */}
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={prerequisiteId}
          onChange={e => setPrerequisiteId(e.target.value)}
          disabled={loading}
        >
          <option value="">لا يوجد متطلب (مستوى أولي)</option>
          {allCourses
            .filter(c => !course || c.id !== course.id) // لا تعرض الدورة نفسها كمتطلب
            .map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
        </select>

        <label className="flex flex-col w-full items-start">
          <span className="text-xs text-slate-700 mb-1">غلاف الدورة (اختياري):</span>
          <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={loading} />
          {coverUrl && <img src={coverUrl} className="mt-2 rounded-xl w-full max-h-32 object-cover border" alt="غلاف" />}
        </label>
        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold shadow"
          >
            {loading ? "جارٍ الحفظ..." : (course ? "حفظ التعديلات" : "إضافة")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-slate-900 px-6 py-2 rounded-lg font-bold shadow border"
            disabled={loading}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
