import { useState, useMemo } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { useGlobalData } from "../../contexts/GlobalDataProvider";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { SlidersHorizontal } from "lucide-react";

// ⭐ النجوم
function StarRating({ value, size = 17 }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="flex items-center gap-0.5 select-none">
      {[1, 2, 3, 4, 5].map(i =>
        <span key={i} style={{ fontSize: size }}
          className={i <= rounded ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      )}
    </span>
  );
}

const COURSES_PER_PAGE = 6;

export default function CoursesPage() {
  const { profile } = useAuth(); // يحتوي على الدور
  const { categories, categoriesLoading, courses, coursesLoading, coursesRatings } = useGlobalData();
  const navigate = useNavigate();

  // البحث والفلترة
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);

  // فلترة محلية
  const filteredCourses = useMemo(() => {
    let result = courses || [];
    if (search.trim()) {
      result = result.filter((course) =>
        course.title?.toLowerCase().includes(search.trim().toLowerCase())
      );
    }
    if (categoryId) {
      result = result.filter((course) => course.category_id === categoryId);
    }
    return result;
  }, [courses, search, categoryId]);

  // Pagination
  const totalPages = Math.ceil((filteredCourses.length || 0) / COURSES_PER_PAGE);
  const pagedCourses = filteredCourses.slice((page - 1) * COURSES_PER_PAGE, page * COURSES_PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-100 pt-6 pb-10 px-2 sm:px-6">
      {/* Header وفلترة */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch w-full md:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ابحث باسم الدورة..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="border border-slate-200 px-4 py-2 pr-10 rounded-xl bg-white shadow-sm focus:border-orange-500 transition w-full"
            />
            <SlidersHorizontal className="absolute right-3 top-2.5 text-orange-400" />
          </div>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 px-3 py-2 rounded-xl bg-white shadow-sm focus:border-orange-500 transition"
          >
            <option value="">كل التصنيفات</option>
            {categoriesLoading ? <option>تحميل...</option> :
              categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name} ({cat.courses_count})</option>
              ))}
          </select>
        </div>
        {profile?.role === "teacher" && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/categories")}
              className="flex items-center gap-2 bg-blue-950 hover:bg-blue-900 text-white px-4 py-2 rounded-2xl font-bold shadow transition text-base"
            >
              إدارة التصنيفات
            </button>
            <button
              onClick={() => navigate("/courses/manage")}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-2xl font-bold shadow transition text-base"
            >
              إدارة الدورات
            </button>
          </div>
        )}
      </div>
      {coursesLoading ? (
        <LoadingSpinner text="تحميل الدورات..." />
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {pagedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isTeacher={profile?.role === "teacher"}
              ratingObj={coursesRatings?.[course.id]}
            />
          ))}
        </div>
      )}
      {!coursesLoading && totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`w-10 h-10 rounded-full font-bold text-lg shadow transition border-2
                ${page === i + 1 ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-slate-200 text-orange-500 hover:border-orange-400"}`}
              onClick={() => setPage(i + 1)}
            >{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ⭐️ تعديل هنا لعرض التقييمات
function CourseCard({ course, isTeacher, ratingObj }) {
  const navigate = useNavigate();
  // إعداد بيانات التقييم (دائماً يوجد كائن ولكن قد يكون فارغ)
  const avg = ratingObj?.avg || "0.0";
  const count = ratingObj?.count || 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-3 items-center hover:shadow-2xl transition min-h-[360px] relative">
      <img
        src={course.cover_url || "https://placehold.co/400x220/orange/white?text=دورة+بدون+غلاف"}
        alt="غلاف الدورة"
        className="w-full h-36 object-cover rounded-xl shadow-sm border mb-1"
        loading="lazy"
      />
      <div className="w-full flex flex-col gap-0.5 items-center text-center">
        <div className="text-lg font-extrabold text-slate-900 line-clamp-2">{course.title}</div>
        <div className="text-xs text-gray-400">{course.category_name || "بدون تصنيف"}</div>
        <div className="text-xs text-gray-400">المعلم: {course.teacher_name || "غير محدد"}</div>
      </div>
      {/* ⭐️ هنا تقييم الدورة */}
      <div className="flex items-center gap-2 mt-1 mb-1">
        <StarRating value={parseFloat(avg)} />
        <span className="text-orange-600 font-bold text-sm">{avg}/5</span>
        <span className="text-xs text-gray-400">({count} تقييم)</span>
      </div>
      <div className="w-full flex justify-between text-xs text-gray-500 mt-2">
        <span>الأقسام: <span className="text-orange-500 font-bold">{course.sections_count || 0}</span></span>
        <span>الطلاب: <span className="text-blue-950 font-bold">{course.students_count || 0}</span></span>
      </div>
      <div className="flex gap-2 mt-auto w-full">
        <button
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-xl font-bold transition text-sm shadow"
          onClick={() => navigate(`/courses/${course.id}`)}
        >محتوى الدورة</button>
        {isTeacher && (
          <button
            className="bg-gray-100 hover:bg-gray-200 text-slate-900 px-3 py-2 rounded-xl font-bold transition text-sm shadow border border-gray-200"
            onClick={() => navigate(`/courses/manage`)}
          >إدارة الدورة</button>
        )}
      </div>
      {course.prerequisite_title &&
        <div className="absolute left-3 top-3 bg-orange-100 text-orange-500 px-2 py-1 rounded-xl text-xs font-bold shadow">
          يتطلب: {course.prerequisite_title}
        </div>
      }
    </div>
  );
}
