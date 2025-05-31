// src/pages/Quiz/QuizAnswersPage.jsx
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../../../services/supabaseClient";
import { LoadingSpinner } from "../../../../components/ui/LoadingSpinner";
import { Card } from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";

export default function QuizAnswersPage() {
    const { quizId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const studentId = new URLSearchParams(location.search).get("student");

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);

    useEffect(() => {
        if (!quizId || !studentId) return;
        fetchAllData();
        // eslint-disable-next-line
    }, [quizId, studentId]);

    async function fetchAllData() {
        setLoading(true);

        // بيانات الطالب
        const { data: profileData, error: profileErr } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", studentId)
            .single();
        setProfile(profileData);

        // بيانات الاختبار
        const { data: quizData, error: quizErr } = await supabase
            .from("quizzes")
            .select("id, title")
            .eq("id", quizId)
            .single();
        setQuiz(quizData);

        // جلب الأسئلة حسب هيكل الجدول لديك
        const { data: questionsData, error: qErr } = await supabase
            .from("quiz_questions")
            .select("id, question_text, option_a, option_b, option_c, option_d, correct_option")
            .eq("quiz_id", quizId);

        if (qErr) {
            console.error("[DEBUG] خطأ جلب الأسئلة:", qErr);
        }
        setQuestions(questionsData || []);
        console.log("[DEBUG] الأسئلة:", questionsData);

        // جلب إجابات الطالب
        const { data: answersData, error: ansErr } = await supabase
            .from("quiz_answers")
            .select("question_id, selected_option, is_correct, answered_at")
            .eq("quiz_id", quizId)
            .eq("user_id", studentId);

        if (ansErr) {
            console.error("[DEBUG] خطأ جلب إجابات الطالب:", ansErr);
        }
        setAnswers(answersData || []);
        console.log("[DEBUG] إجابات الطالب:", answersData);

        setLoading(false);
    }

    if (loading) return <LoadingSpinner text="تحميل بيانات الإجابات..." />;

    if (!quizId || !studentId) {
        return (
            <div className="max-w-2xl mx-auto py-10 px-2">
                <Card className="p-6 text-center text-red-600 font-bold text-lg">
                    خطأ في رابط الصفحة! <br />
                    لا يوجد اختبار أو طالب محدد.
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-10 px-2">
            {/* بيانات الطالب + اسم الاختبار */}
            <Card className="mb-6 flex items-center gap-4">
                <img
                    src={profile?.avatar_url || "https://placehold.co/40x40"}
                    alt="avatar"
                    className="w-12 h-12 rounded-full border"
                />
                <div>
                    <div className="font-bold text-lg text-blue-950">{profile?.full_name || "طالب"}</div>
                    <div className="text-xs text-gray-400 mt-1">
                        اختبار: <span className="text-orange-600">{quiz?.title || "..."}</span>
                    </div>
                </div>
                <div className="ml-auto">
                    <Button
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 border shadow-none"
                        onClick={() => navigate(-1)}
                    >
                        رجوع
                    </Button>
                </div>
            </Card>

            <h2 className="text-xl font-bold text-blue-900 mb-4 text-center">
                إجابات الطالب في الاختبار
            </h2>

            {!questions.length ? (
                <div className="text-gray-500 text-center">لا يوجد أسئلة لهذا الاختبار.</div>
            ) : (
                <ol className="space-y-5">
                    {questions.map((q, idx) => {
                        const answer = answers.find(a => a.question_id === q.id);

                        // جمع الخيارات حسب الترتيب
                        const options = [
                            q.option_a,
                            q.option_b,
                            q.option_c,
                            q.option_d,
                        ];

                        // استخراج نص الإجابة المختارة
                        let selectedText = "لم يجب";
                        if (answer?.selected_option) {
                            // الحروف: a/b/c/d  --> 0/1/2/3
                            const optIdx = { a: 0, b: 1, c: 2, d: 3 }[answer.selected_option.toLowerCase()];
                            selectedText = options[optIdx] || `الخيار ${answer.selected_option}`;
                        }

                        // استخراج نص الإجابة الصحيحة
                        const correctOptIdx = { a: 0, b: 1, c: 2, d: 3 }[q.correct_option?.toLowerCase()];
                        const correctText = options[correctOptIdx] || "-";

                        return (
                            <li key={q.id} className="bg-white rounded-xl shadow p-5 border">
                                <div className="mb-2 font-bold text-orange-700">
                                    سؤال {idx + 1}: <span className="text-slate-900">{q.question_text}</span>
                                </div>
                                <ul className="mb-2 pl-4 list-[upper-alpha] text-slate-700">
                                    {options.map((opt, oidx) => (
                                        <li key={oidx}>{opt}</li>
                                    ))}
                                </ul>
                                <div className="mb-1 flex items-center gap-2">
                                    <span className="font-bold">إجابة الطالب:</span>
                                    <span className={answer?.is_correct ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                                        {selectedText}
                                    </span>
                                    {answer?.is_correct ? (
                                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">إجابة صحيحة</span>
                                    ) : (
                                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">
                                            {answer?.selected_option ? "إجابة خاطئة" : "لم يتم الإجابة"}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    الإجابة الصحيحة: <span className="text-emerald-800 font-bold">{correctText}</span>
                                </div>
                                {answer?.answered_at &&
                                    <div className="text-xs text-gray-400 mt-1">
                                        وقت الإجابة: {answer.answered_at?.slice(0, 16).replace("T", " ")}
                                    </div>
                                }
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
}
