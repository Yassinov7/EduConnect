import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { useGlobalData } from "../../contexts/GlobalDataProvider";
import { useCoursesData } from "../../contexts/CoursesDataContext";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { SlidersHorizontal } from "lucide-react";
import CourseCard from "./components/CourseCard";

const COURSES_PER_PAGE = 6;

export default function CoursesPage() {
  const { profile } = useAuth(); // يحتوي على الدور
  const { categories, categoriesLoading, courses, coursesLoading } = useGlobalData();
  const { ratingsMap, fetchCourseRating } = useCoursesData();
  const navigate = useNavigate();

  // البحث والفلترة
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);

  // جلب التقييمات لكل دورة عند التغيير
  useEffect(() => {
    if (courses && courses.length) {
      courses.forEach(course => {
        // إذا لم يتم تحميل التقييم مسبقاً
        if (!ratingsMap[course.id]) {
          fetchCourseRating(course.id, profile?.user_id || profile?.id);
        }
      });
    }
    // eslint-disable-next-line
  }, [courses, profile]);

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
              ratingObj={ratingsMap?.[course.id]}
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
