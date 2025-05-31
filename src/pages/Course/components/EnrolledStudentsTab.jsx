// src/pages/Courses/components/EnrolledStudentsTab.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../services/supabaseClient";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import Button from "../../../components/ui/Button";
import { toast } from "sonner";
import { CheckCircle, XCircle, BarChart } from "lucide-react";

export default function EnrolledStudentsTab({ courseId }) {
    const [students, setStudents] = useState([]);
    const [profiles, setProfiles] = useState({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line
    }, [courseId]);

    async function fetchStudents() {
        setLoading(true);

        const { data: enrollments, error } = await supabase
            .from("course_enrollments")
            .select("*")
            .eq("course_id", courseId);

        if (error) {
            setStudents([]);
            setProfiles({});
            setLoading(false);
            toast.error("تعذر تحميل الطلاب!");
            return;
        }
        setStudents(enrollments || []);

        if (enrollments && enrollments.length > 0) {
            const userIds = enrollments.map(e => e.user_id);
            const { data: profs, error: profileErr } = await supabase
                .from("profiles")
                .select("user_id, full_name, avatar_url")
                .in("user_id", userIds);
            if (profileErr) {
                setProfiles({});
            } else {
                const profileMap = {};
                if (profs) {
                    profs.forEach(p => profileMap[p.user_id] = p);
                }
                setProfiles(profileMap);
            }
        } else {
            setProfiles({});
        }
        setLoading(false);
    }

    async function handleToggleCompleted(student) {
        setUpdating(student.id);
        const nextState = !student.is_completed;
        const { error } = await supabase
            .from("course_enrollments")
            .update({ is_completed: nextState })
            .eq("id", student.id);

        if (!error) {
            toast.success(`تم تحديث حالة الطالب`);
            await fetchStudents();
        } else {
            toast.error("تعذر تحديث الحالة! حاول لاحقاً.");
        }
        setUpdating(null);
    }

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
                            const profile = profiles[student.user_id] || null;
                            return (
                                <tr key={student.id} className="border-b hover:bg-orange-50 transition">
                                    <td className="py-2 px-4">{idx + 1}</td>
                                    <td className="py-2 px-4 flex items-center gap-2">
                                        <img
                                            src={profile?.avatar_url || "https://placehold.co/32x32"}
                                            alt="avatar"
                                            className="w-8 h-8 rounded-full border"
                                        />
                                        <span>{profile?.full_name || "غير معروف"}</span>
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
                                            className={student.is_completed
                                                ? "bg-slate-600 text-white hover:bg-slate-700"
                                                : "bg-emerald-500 text-white hover:bg-green-600"
                                            }
                                            onClick={() => handleToggleCompleted(student)}
                                            disabled={updating === student.id}
                                        >
                                            {student.is_completed ? "إلغاء الإتمام" : "إتمام الدورة"}
                                        </Button>
                                        {/* زر لعرض النتائج */}
                                        <Button
                                            size="sm"
                                            className="bg-blue-900 text-white hover:bg-blue-700 flex items-center gap-1"
                                            onClick={() => navigate(`/quiz/results/${courseId}/${student.user_id}`)}
                                        >
                                            <BarChart size={18} /> نتائج الطالب
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
