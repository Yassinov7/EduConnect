// src/pages/Courses/components/EnrolledStudentsTab.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCoursesData } from "../../../contexts/CoursesDataContext";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import Button from "../../../components/ui/Button";
import { CheckCircle, XCircle, BarChart } from "lucide-react";

export default function EnrolledStudentsTab({ courseId }) {
    const navigate = useNavigate();
    const {
        enrolledMap,
        fetchEnrolledStudents,
        updateEnrollmentCompletion,
        loading,
    } = useCoursesData();

    // عند تغيير الكورس: جلب بيانات الطلاب المسجلين
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
            <h2 className="text-xl font-bold mb-4 text-blue-900">الطلاب المسجلون ({students.length})</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow border">
                    <thead>
                        <tr className="bg-slate-50 text-orange-700 font-bold text-base">
                            <th className="py-3 px-4 text-right">#</th>
                            <th className="py-3 px-4 text-right">اسم الطالب</th>
                            <th className="py-3 px-4 text-right">الحالة</th>
                            <th className="py-3 px-4 text-right">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, idx) => {
                            const profile = student.profile || {};
                            return (
                                <tr key={student.id} className="border-b hover:bg-orange-50 transition">
                                    <td className="py-2 px-4">{idx + 1}</td>
                                    <td className="py-2 px-4 flex items-center gap-2">
                                        <img
                                            src={profile.avatar_url || "https://placehold.co/32x32"}
                                            alt="avatar"
                                            className="w-8 h-8 rounded-full border"
                                        />
                                        <span>{profile.full_name || "غير معروف"}</span>
                                    </td>
                                    <td className="py-2 px-4">
                                        {student.is_completed ? (
                                            <span className="flex items-center gap-1 text-green-700 font-bold">
                                                <CheckCircle size={18} /> أتم الدورة
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-orange-700 font-bold">
                                                <XCircle size={18} /> لم يتمم الدورة
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-2 px-4 flex gap-2">
                                        <Button
                                            size="sm"
                                            className={
                                                student.is_completed
                                                    ? "bg-slate-600 text-white hover:bg-slate-700"
                                                    : "bg-emerald-500 text-white hover:bg-green-600"
                                            }
                                            onClick={() =>
                                                updateEnrollmentCompletion(student.id, courseId, !student.is_completed)
                                            }
                                        >
                                            {student.is_completed ? "إلغاء الإتمام" : "إتمام الدورة"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="bg-blue-900 text-white hover:bg-blue-700 flex items-center gap-1"
                                            onClick={() => navigate(`/quiz/results/${courseId}/${student.user_id}`)}
                                        >
                                            <BarChart size={18} /> نتائج الطالب
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
