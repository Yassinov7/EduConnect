import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "../../../../components/ui/LoadingSpinner";
import { Card } from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import { useQuizData } from "../../../../contexts/QuizDataProvider";
import { supabase } from "../../../../services/supabaseClient"; // فقط للبروفايل (ممكن عملها بسياقك العام لو عندك)

export default function StudentQuizResultsPage() {
    const { courseId, studentId } = useParams();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const { fetchStudentCourseQuizResults, loading: quizLoading } = useQuizData();

    useEffect(() => {
        fetchResults();
        // eslint-disable-next-line
    }, [courseId, studentId]);

    async function fetchResults() {
        setLoading(true);
        setError(null);

        // جلب معلومات الطالب (يُفضل نقلها لسياق المستخدم إذا كان متاح)
        try {
            const { data: profileData } = await supabase
                .from("profiles")
                .select("full_name, avatar_url")
                .eq("user_id", studentId)
                .single();

            setProfile(profileData || null);
        } catch (err) {
            setError("خطأ غير متوقع في جلب بروفايل الطالب");
        }

        // جلب النتائج عبر السياق
        try {
            const results = await fetchStudentCourseQuizResults(courseId, studentId);
            setQuizzes(results);
        } catch (err) {
            setError("تعذر جلب نتائج الطالب");
        }

        setLoading(false);
    }

    if (loading || quizLoading)
        return <LoadingSpinner text="تحميل نتائج الطالب..." />;
    if (error)
        return <div className="text-center text-red-600 py-10">{error}</div>;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <Card className="mb-4 flex items-center gap-3">
                <img src={profile?.avatar_url || "https://placehold.co/32x32"} alt="avatar" className="w-10 h-10 rounded-full border" />
                <div>
                    <div className="font-bold text-lg">{profile?.full_name || "طالب"}</div>
                    <div className="text-xs text-gray-400">ID: {studentId}</div>
                </div>
            </Card>
            <h2 className="text-xl font-bold text-blue-900 mb-4">نتائج الطالب في الاختبارات</h2>
            {!quizzes.length ? (
                <div className="text-gray-500 text-center">لا يوجد نتائج بعد.</div>
            ) : (
                <table className="min-w-full bg-white rounded-xl shadow border">
                    <thead>
                        <tr className="bg-slate-50 text-orange-700 font-bold text-base">
                            <th className="py-3 px-4 text-right">اسم الاختبار</th>
                            <th className="py-3 px-4 text-right">الدرجة (صح / كل)</th>
                            <th className="py-3 px-4 text-right">آخر إجابة</th>
                            <th className="py-3 px-4 text-right">عرض الإجابات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quizzes.map(result => (
                            <tr key={result.quiz_id} className="border-b">
                                <td className="py-2 px-4">{result.quiz_title || "اختبار"}</td>
                                <td className="py-2 px-4 font-bold text-emerald-700">{result.correctCount} / {result.totalCount}</td>
                                <td className="py-2 px-4">{result.lastAnsweredAt ? result.lastAnsweredAt.slice(0, 16).replace("T", " ") : "-"}</td>
                                <td className="py-2 px-4">
                                    <Button onClick={() => navigate(`/quiz/answers/${result.quiz_id}?student=${studentId}`)}>
                                        رؤية الإجابات
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
