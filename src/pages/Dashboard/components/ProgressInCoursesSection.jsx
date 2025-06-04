import { useProgress } from "../../../contexts/ProgressContext";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { BookOpen, ChevronRight } from "lucide-react";

export function ProgressInCoursesSection({ courses }) {
  const { calculateCourseProgress } = useProgress();
  const navigate = useNavigate();

  if (!courses?.length) return null;

  return (
    <div className="w-full mt-8 px-2 pb-10 sm:px-4">
      <h2 className="font-extrabold text-orange-600 mb-6 text-2xl flex items-center gap-2">
        <BookOpen size={24} /> تقدمي في الدورات
      </h2>
      <div className="
        grid gap-6
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        2xl:grid-cols-4
        w-full
      ">
        {courses.map((course) => {
          const percent = calculateCourseProgress(course.sections || []);
          let barColor = "bg-red-500";
          if (percent >= 80) barColor = "bg-green-500";
          else if (percent >= 50) barColor = "bg-orange-500";

          return (
            <div
              key={course.id}
              className={`
    group flex flex-col justify-between items-center
    bg-white/95 rounded-2xl shadow-md hover:shadow-xl border border-orange-100
    hover:border-orange-300
    p-5 w-full min-h-[270px] transition-all duration-300 cursor-pointer
  `}
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              {/* أعلى البطاقة: الصورة */}
              <div className="w-16 h-16 mb-1 flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden border border-orange-200">
                <img
                  src={course.cover_url || "https://placehold.co/80x80/orange/white?text=Course"}
                  alt={course.title}
                  className="object-cover w-14 h-14"
                  loading="lazy"
                />
              </div>

              {/* منتصف البطاقة: العنوان والوسام */}
              <div className="w-full flex flex-col items-center mb-2">
                {percent === 100 && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-lg font-bold mb-1">مكتمل</span>
                )}
                <span className="font-bold text-orange-800 text-base text-center line-clamp-2">{course.title}</span>
              </div>

              {/* شريط التقدم */}
              <div className="w-full mt-2">
                <ProgressBar percent={percent} barClass={barColor} />
                <div className="text-xs text-gray-500 mt-1 text-center">{percent}% مكتمل</div>
              </div>

              {/* زر دخول الدورة */}
              <div className="w-full flex justify-center mt-3">
                <span className="flex items-center gap-1 text-orange-600 font-semibold text-sm hover:text-orange-800 transition-all">
                  دخول الدورة
                  <ChevronRight size={19} className="group-hover:translate-x-1 transition-all" />
                </span>
              </div>
            </div>

          );
        })}
      </div>
    </div>
  );
}
