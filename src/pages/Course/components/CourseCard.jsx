import { useNavigate } from "react-router-dom";

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

export default function CourseCard({ course, isTeacher, ratingObj }) {
    const navigate = useNavigate();
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
