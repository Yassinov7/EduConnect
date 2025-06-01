import { useState } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { useGlobalData } from "../../contexts/GlobalDataProvider";
import { PlusCircle, Edit, Trash2, BookOpen, AlertTriangle } from "lucide-react";
import CourseFormModal from "./CourseFormModal";

export default function CoursesManagementPage() {
  const { user, loading: userLoading } = useAuth();
  const {
    courses,
    coursesLoading,
    categories,
    deleteCourseWithCover, // استخدم دالة الحذف من السياق
  } = useGlobalData();

  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // فقط دورات هذا المعلم
  const teacherCourses = courses.filter(c => c.teacher_id === user?.id);

  if (userLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        جاري تحميل الدورات...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-orange-500 flex gap-2 items-center">
            <BookOpen /> إدارة الدورات
          </h1>
          <button
            className="flex gap-2 items-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold shadow transition"
            onClick={() => {
              setEditCourse(null);
              setShowForm(true);
            }}
          >
            <PlusCircle /> إضافة دورة جديدة
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teacherCourses.length === 0 && (
            <div className="text-center text-gray-600 py-10 col-span-2">
              لا توجد دورات بعد.
            </div>
          )}
          {teacherCourses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-lg p-5 flex flex-col gap-2">
              <div className="flex gap-4 items-center">
                <img
                  src={course.cover_url || "https://placehold.co/120x80/orange/white?text=Course"}
                  className="w-28 h-20 object-cover rounded-lg border"
                  alt="غلاف الدورة"
                />
                <div>
                  <div className="text-lg font-bold text-slate-900">{course.title}</div>
                  <div className="text-xs text-gray-500">التصنيف: {course.category_name || "بدون تصنيف"}</div>
                  <div className="text-xs text-gray-500">الطلاب: {course.students_count || 0}</div>
                  {course.prerequisite_title && (
                    <div className="text-xs text-orange-400">متطلب: {course.prerequisite_title}</div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  className="flex-1 flex gap-1 items-center justify-center bg-gray-100 hover:bg-gray-200 text-slate-900 px-3 py-2 rounded-xl font-bold transition text-sm shadow border border-gray-200"
                  onClick={() => {
                    setEditCourse(course);
                    setShowForm(true);
                  }}
                >
                  <Edit size={18} /> تعديل
                </button>
                <button
                  className="flex-1 flex gap-1 items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-xl font-bold transition text-sm shadow border border-red-200"
                  onClick={() => setDeleting(course)}
                >
                  <Trash2 size={18} /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal لإضافة/تعديل دورة */}
      {showForm && (
        <CourseFormModal
          course={editCourse}
          categories={categories}
          allCourses={teacherCourses}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
          }}
        />
      )}

      {/* حوار تأكيد الحذف بشكل احترافي */}
      {deleting && (
        <DeleteConfirmation
          title={`حذف الدورة "${deleting.title}"`}
          message="هل أنت متأكد أنك تريد حذف هذه الدورة؟ لا يمكن التراجع!"
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await deleteCourseWithCover(deleting); // من السياق
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}

// Modal حذف احترافي
function DeleteConfirmation({ title, message, onCancel, onConfirm }) {
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
