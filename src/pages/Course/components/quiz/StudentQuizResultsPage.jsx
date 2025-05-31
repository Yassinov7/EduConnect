// src/pages/Quiz/StudentQuizResultsPage.jsx
import { useParams, useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../../../services/supabaseClient";
import { LoadingSpinner } from "../../../../components/ui/LoadingSpinner";
import { Card } from "../../../../components/ui/Card";
import  Button  from "../../../../components/ui/Button";

export default function StudentQuizResultsPage() {
    const { courseId, studentId } = useParams();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [quizzes, setQuizzes] = useState([]); // [{quiz_id, quiz_title, correctCount, totalCount, lastAnsweredAt}]
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchResults();
        // eslint-disable-next-line
    }, [courseId, studentId]);

    async function fetchResults() {
        setLoading(true);
        setError(null);

        // 1. جلب معلومات الطالب
        try {
            const { data: profileData, error: profileErr } = await supabase
                .from("profiles")
                .select("full_name, avatar_url")
                .eq("user_id", studentId)
                .single();

            if (profileErr) {
                setError("تعذر جلب بروفايل الطالب");
                console.error("[DEBUG] profileErr:", profileErr);
            }
            setProfile(profileData || null);

        } catch (err) {
            setError("خطأ غير متوقع في جلب بروفايل الطالب");
            console.error("[DEBUG] profile catch err:", err);
        }

        // 2. جلب جميع sections لهذا الكورس
        let sectionIds = [];
        try {
            const { data: sections, error: sectionErr } = await supabase
                .from("sections")
                .select("id")
                .eq("course_id", courseId);

            if (sectionErr) {
                setError("تعذر جلب بيانات الوحدات (sections)");
                console.error("[DEBUG] sectionErr:", sectionErr);
            }
            sectionIds = (sections || []).map(s => s.id);
        } catch (err) {
            setError("خطأ في جلب بيانات الوحدات");
            console.error("[DEBUG] sections catch err:", err);
        }

        if (!sectionIds.length) {
            setQuizzes([]);
            setLoading(false);
            return;
        }

        // 3. جلب كل الاختبارات quizzes لهذه الـ sections
        let quizzesData = [];
        try {
            const { data, error: quizErr } = await supabase
                .from("quizzes")
                .select("id, title, section_id")
                .in("section_id", sectionIds);

            if (quizErr) {
                setError("تعذر جلب بيانات الاختبارات");
                console.error("[DEBUG] quizErr:", quizErr);
            }
            quizzesData = data || [];
        } catch (err) {
            setError("خطأ في جلب بيانات الاختبارات");
            console.error("[DEBUG] quizzes catch err:", err);
        }

        // 4. جلب جميع الاجابات للطالب في هذه الاختبارات
        let answers = [];
        try {
            const quizIds = (quizzesData || []).map(q => q.id);
            if (!quizIds.length) {
                setQuizzes([]);
                setLoading(false);
                return;
            }

            const { data, error: answersErr } = await supabase
                .from("quiz_answers")
                .select("quiz_id, is_correct, answered_at")
                .eq("user_id", studentId)
                .in("quiz_id", quizIds);

            if (answersErr) {
                setError("تعذر جلب بيانات إجابات الطالب");
                console.error("[DEBUG] answersErr:", answersErr);
            }
            answers = data || [];
        } catch (err) {
            setError("خطأ في جلب بيانات الإجابات");
            console.error("[DEBUG] answers catch err:", err);
        }

        // 5. بناء ملخص النتائج
        const quizSummary = {};
        (answers || []).forEach(ans => {
            if (!quizSummary[ans.quiz_id]) {
                quizSummary[ans.quiz_id] = {
                    correctCount: 0,
                    totalCount: 0,
                    lastAnsweredAt: ans.answered_at,
                };
            }
            if (ans.is_correct) quizSummary[ans.quiz_id].correctCount += 1;
            quizSummary[ans.quiz_id].totalCount += 1;
            if (ans.answered_at > quizSummary[ans.quiz_id].lastAnsweredAt) {
                quizSummary[ans.quiz_id].lastAnsweredAt = ans.answered_at;
            }
        });

        // 6. دمج مع بيانات العناوين
        const quizList = (quizzesData || []).map(quiz => ({
            quiz_id: quiz.id,
            quiz_title: quiz.title,
            correctCount: quizSummary[quiz.id]?.correctCount || 0,
            totalCount: quizSummary[quiz.id]?.totalCount || 0,
            lastAnsweredAt: quizSummary[quiz.id]?.lastAnsweredAt || null,
        })).filter(q => q.totalCount > 0);

        setQuizzes(quizList);

        setLoading(false);
    }

    if (loading)
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
