import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCoursesData } from "../../../contexts/CoursesDataContext";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { CheckCircle, XCircle, BarChart } from "lucide-react";

export default function EnrolledStudentsTab({ courseId }) {
    const navigate = useNavigate();
    const {
        enrolledMap,
        fetchEnrolledStudents,
        updateEnrollmentCompletion,
        loading,
    } = useCoursesData();

    useEffect(() => {
        if (courseId) fetchEnrolledStudents(courseId);
        // eslint-disable-next-line
    }, [courseId]);

    const students = enrolledMap[courseId] || [];

    if (loading)
        return <LoadingSpinner text="جاري تحميل الطلاب المسجلين..." />;

    if (!students.length)
        return <div className="py-8 text-center text-gray-400">لا يوجد طلاب مسجلون حتى الآن.</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-blue-900 text-center">
                الطلاب المسجلون ({students.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
                {students.map((student, idx) => {
                    const profile = student.profile || {};
                    return (
                        <div
                            key={student.id}
                            className="
                bg-white rounded-2xl shadow-lg border border-orange-100
                flex flex-col items-center gap-5 py-7 px-6
                min-h-[260px]
                transition hover:shadow-2xl hover:border-orange-300
              "
                        >
                            <img
                                src={profile.avatar_url || "https://placehold.co/80x80"}
                                alt="avatar"
                                className="w-20 h-20 rounded-full border-2 border-orange-300 shadow"
                            />
                            <div className="flex flex-col items-center gap-1">
                                <div className="font-bold text-xl text-orange-700 tracking-wide">
                                    {profile.full_name || "غير معروف"}
                                </div>
                                <div className="text-gray-500 text-xs">#{idx + 1}</div>
                                <div>
                                    {student.is_completed ? (
                                        <span className="flex items-center gap-1 text-green-700 font-bold text-base mt-2">
                                            <CheckCircle size={22} /> أتم الدورة
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-orange-700 font-bold text-base mt-2">
                                            <XCircle size={22} /> لم يتمم الدورة
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 w-full mt-3">
                                <button
                                    className={`
                                            rounded-xl py-2 font-semibold transition
                                            w-full text-lg
                                            ${student.is_completed
                                            ? "bg-slate-700 text-white hover:bg-slate-800"
                                            : "bg-emerald-500 text-white hover:bg-emerald-600"}
                                            `}
                                    onClick={() =>
                                        updateEnrollmentCompletion(student.id, courseId, !student.is_completed)
                                    }
                                >
                                    {student.is_completed ? "إلغاء الإتمام" : "إتمام الدورة"}
                                </button>
                                <button
                                    className="
                    rounded-xl py-2 font-semibold w-full flex items-center justify-center gap-2
                    bg-blue-900 text-white hover:bg-blue-700 transition text-lg
                  "
                                    onClick={() => navigate(`/quiz/results/${courseId}/${student.user_id}`)}
                                >
                                    <BarChart size={20} /> نتائج الطالب
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
