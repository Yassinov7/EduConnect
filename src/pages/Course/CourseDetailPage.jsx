import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { useGlobalData } from "../../contexts/GlobalDataProvider";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, UserCircle, Edit, Trash2, Users, MessageCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { supabase } from "../../services/supabaseClient";
import { toast } from "sonner";
import { useCoursesData } from "../../contexts/CoursesDataContext"; // ⭐️

import SectionTabs from "./components/section/SectionTabs";
import CommentsTab from "./components/comments/CommentsTab";
import EnrolledStudentsTab from "./components/EnrolledStudentsTab";
import DeleteConfirmation from "../../components/ui/DeleteConfirmation";
import CourseFormModal from "./CourseFormModal";

// ⭐ مكون عرض النجوم
function StarRating({ value, size = 19 }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="flex items-center gap-0.5 select-none">
      {[1, 2, 3, 4, 5].map((i) =>
        <span key={i} style={{ fontSize: size }}
          className={i <= rounded ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      )}
    </span>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams(); // courseId
  const { user, profile } = useAuth();
  const { courses, coursesLoading, fetchCourses, categories, courses: allCourses } = useGlobalData();
  const { ratingsMap, fetchCourseRating, setCourseRating } = useCoursesData(); // ⭐️
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("content");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnroll, setCheckingEnroll] = useState(true);

  // جلب بيانات الدورة
  const course = useMemo(() => courses.find(c => c.id === id), [courses, id]);
  const isTeacher = profile?.role === "teacher" && course?.teacher_id === user?.id;

  // تقييم الدورة من السياق الجديد
  const ratingObj = ratingsMap?.[course?.id] || { avg: "0.0", count: 0, myRating: 0 };
  const [ratingLoading, setRatingLoading] = useState(false);

  // تحقق من الاشتراك
  useEffect(() => {
    let ignore = false;
    async function checkEnrollment() {
      setCheckingEnroll(true);
      if (user && course?.id && !isTeacher) {
        const { data: enr } = await supabase
          .from("course_enrollments")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", course.id);
        if (!ignore) setEnrolled(!!(enr && enr.length > 0));
      } else if (isTeacher) {
        setEnrolled(true); // المعلم يرى المحتوى دائمًا
      }
      setCheckingEnroll(false);
    }
    checkEnrollment();
    return () => { ignore = true; };
  }, [user, course, isTeacher]);

  // جلب التقييم عند تغير الدورة أو المستخدم
  useEffect(() => {
    if (course?.id && user?.id) {
      fetchCourseRating(course.id, user.id);
    }
    // eslint-disable-next-line
  }, [course?.id, user?.id]);

  useEffect(() => {
    if (!coursesLoading && !course) {
      navigate("/404", { replace: true });
    }
  }, [coursesLoading, course, navigate]);

  if (coursesLoading || !course || checkingEnroll)
    return <LoadingSpinner text="تحميل بيانات الدورة..." />;

  // زر الاشتراك في الدورة (للطالب فقط)
  async function handleEnroll() {
    if (!user) return;
    // تحقق من متطلبات الدورة prerequisite
    if (course?.prerequisite_id) {
      const { data: preEnroll } = await supabase
        .from("course_enrollments")
        .select("is_completed")
        .eq("user_id", user.id)
        .eq("course_id", course.prerequisite_id)
        .single();

      if (!preEnroll?.is_completed) {
        toast.error("لا يمكنك التسجيل في هذه الدورة حتى تُكمل الدورة المطلوبة أولاً.");
        return;
      }
    }
    // إذا لا يوجد متطلب، أو المتطلب مكتمل، نفذ الاشتراك
    const { error } = await supabase.from("course_enrollments").insert([{ user_id: user.id, course_id: course.id }]);
    if (!error) {
      setEnrolled(true);
      toast.success("تم تسجيلك في الدورة بنجاح.");
    } else {
      toast.error("حدث خطأ أثناء التسجيل! حاول لاحقًا.");
    }
  }

  // عند تغيير تقييم المستخدم
  async function handleUserRating(newRating) {
    setRatingLoading(true);
    await setCourseRating(course.id, user.id, newRating);
    await fetchCourseRating(course.id, user.id);
    setRatingLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-100 pt-10 pb-16 px-2 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* بيانات الدورة */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 bg-white shadow-lg rounded-xl p-6 mb-8 relative">
          <img
            src={course.cover_url || "https://placehold.co/320x180/orange/white?text=دورة"}
            alt="غلاف الدورة"
            className="w-full md:w-64 h-40 object-cover rounded-xl border shadow"
            loading="lazy"
          />
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 items-center mb-1">
              <span className="text-2xl font-bold text-orange-500">{course.title}</span>
              {course.prerequisite_title && (
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-xl text-xs font-bold shadow">متطلب: {course.prerequisite_title}</span>
              )}
            </div>
            {/* ⭐️ عرض التقييم أسفل العنوان مباشرة */}
            <div className="flex items-center gap-2 mb-1 mt-1">
              <StarRating value={parseFloat(ratingObj.avg)} />
              <span className="text-orange-600 font-bold text-base">{ratingObj.avg}/5</span>
              <span className="text-xs text-gray-400">({ratingObj.count} تقييم)</span>
              <span className="mx-2 hidden sm:block">|</span>
              {/* تقييم المستخدم الحالي */}
              {user && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">تقييمك:</span>
                  <StarRating
                    value={Number(ratingObj.myRating)}
                    onChange={handleUserRating}
                    readOnly={ratingLoading}
                  />
                  {ratingLoading && <span className="text-xs text-gray-400">جاري الحفظ...</span>}
                </div>
              )}
            </div>
            <div className="text-gray-700">{course.description || "لا يوجد وصف للدورة."}</div>
            <div className="flex gap-4 text-xs mt-2">
              <span className="bg-blue-50 text-blue-950 rounded px-2 py-1">{course.category_name || "بدون تصنيف"}</span>
              <span className="bg-gray-100 text-gray-700 rounded px-2 py-1">الطلاب: {course.students_count}</span>
              <span className="bg-orange-50 text-orange-600 rounded px-2 py-1">الأقسام: {course.sections_count}</span>
              <span className="bg-gray-50 text-gray-700 rounded px-2 py-1 flex items-center gap-1">
                <UserCircle size={16} className="text-orange-400" />
                {course.teacher_name || "غير محدد"}
              </span>
            </div>
            {/* أزرار المعلم فقط */}
            {isTeacher && (
              <div className="flex gap-3 mt-4">
                <Button onClick={() => setShowEditModal(true)} className="bg-orange-500 hover:bg-orange-600">
                  <Edit size={18} /> تعديل
                </Button>
                <Button onClick={() => setShowDelete(true)} className="bg-red-500 text-white hover:bg-red-600">
                  <Trash2 size={18} /> حذف
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* تبويبات المحتوى */}
        <div className="bg-white rounded-xl shadow mb-8 flex gap-0.5">
          <TabButton
            active={activeTab === "content"}
            onClick={() => setActiveTab("content")}
            icon={<BookOpen size={22} />}
            label="المحتوى"
          />
          <TabButton
            active={activeTab === "comments"}
            onClick={() => setActiveTab("comments")}
            icon={<MessageCircle size={22} />}
            label="التعليقات والتقييم"
          />
          {isTeacher && (
            <TabButton
              active={activeTab === "students"}
              onClick={() => setActiveTab("students")}
              icon={<Users size={22} />}
              label="الطلاب المسجلون"
            />
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === "content" && (
            (isTeacher || enrolled) ? (
              <SectionTabs courseId={course.id} isTeacher={isTeacher} />
            ) : (
              <div className="text-center py-10 text-xl text-orange-600 flex flex-col items-center gap-4">
                <span>يجب التسجيل في الدورة للوصول إلى الدروس والاختبارات.</span>
                <Button
                  className="bg-orange-500 text-white px-7 py-2 rounded-xl text-lg font-bold"
                  onClick={handleEnroll}
                >
                  التسجيل في الدورة
                </Button>
              </div>
            )
          )}
          {activeTab === "comments" && (
            <CommentsTab courseId={course.id} user={user} />
          )}
          {activeTab === "students" && isTeacher && (
            <EnrolledStudentsTab courseId={course.id} />
          )}
        </div>
      </div>

      {/* Modal التعديل */}
      {showEditModal && (
        <CourseFormModal
          course={course}
          categories={categories}
          allCourses={allCourses}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            setShowEditModal(false);
            fetchCourses();
          }}
        />
      )}

      {/* حذف */}
      {showDelete && (
        <DeleteConfirmation
          title={`حذف الدورة "${course.title}"`}
          message="هل أنت متأكد أنك تريد حذف هذه الدورة؟ لا يمكن التراجع!"
          onCancel={() => setShowDelete(false)}
          onConfirm={async () => {
            await supabase.from("courses").delete().eq("id", course.id);
            fetchCourses();
            setShowDelete(false);
            navigate("/courses");
          }}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      className={`flex-1 flex items-center justify-center gap-2 py-3 font-bold rounded-t-xl transition
        ${active ? "bg-orange-500 text-white shadow" : "bg-slate-50 text-slate-700 hover:bg-orange-100"}
      `}
      onClick={onClick}
    >
      {icon} {label}
    </button>
  );
}
