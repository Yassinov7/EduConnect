import { useEffect, useState } from "react";
import { useAuth } from "../../../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../../../components/ui/LoadingSpinner";
import { Card } from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import { useQuizData } from "../../../../contexts/QuizDataProvider";

export default function StudentAllResultsPage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const { fetchStudentAllQuizResults, loading } = useQuizData();

    const [courses, setCourses] = useState([]);
    const [quizzes, setQuizzes] = useState({});
    const [results, setResults] = useState({});

    useEffect(() => {
        if (!user) return;
        (async () => {
            const { courses, quizzesByCourse, resultsMap } = await fetchStudentAllQuizResults(user.id);
            setCourses(courses);
            setQuizzes(quizzesByCourse);
            setResults(resultsMap);
        })();
        // eslint-disable-next-line
    }, [user]);

    if (loading) return <LoadingSpinner text="تحميل نتائجك..." />;

    if (!courses.length)
        return (
            <div className="max-w-lg mx-auto mt-10 text-center text-gray-400 text-xl">
                لم تسجل بأي دورة بعد.
            </div>
        );

    return (
        <div className="max-w-4xl mx-auto py-10 px-2">
            <div className="mb-8 flex flex-col items-center gap-2">
                <img src={profile?.avatar_url || "https://placehold.co/64x64"} alt="avatar" className="w-16 h-16 rounded-full border" />
                <div className="text-xl font-bold text-orange-600">{profile?.full_name || "الطالب"}</div>
                <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
            <h2 className="text-2xl font-extrabold text-blue-950 mb-7 text-center">نتائج الاختبارات في الدورات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {courses.map(course => (
                    <Card key={course.id} className="p-5 shadow-lg flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <img src={course.cover_url || "https://placehold.co/80x50"} alt={course.title} className="rounded-lg w-20 h-14 object-cover border" />
                            <div>
                                <div className="font-bold text-lg text-orange-600">{course.title}</div>
                                <div className="text-gray-500 text-xs">{course.description}</div>
                            </div>
                        </div>
                        <div className="mt-2">
                            <h4 className="font-bold text-blue-800 mb-1">اختبارات الدورة:</h4>
                            {quizzes[course.id]?.length ? (
                                <ul className="space-y-2">
                                    {quizzes[course.id].map(quiz => {
                                        const res = results[quiz.id];
                                        return (
                                            <li key={quiz.id} className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900">{quiz.title}</span>
                                                {res?.score != null ? (
                                                    <>
                                                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">
                                                            نتيجتك: {res.score}%
                                                        </span>
                                                        <Button
                                                            className="ml-2 bg-blue-100 text-blue-900 hover:bg-blue-200 text-xs py-1 px-3 rounded shadow-none"
                                                            onClick={() => navigate(`/quiz/answers/${quiz.id}?student=${user.id}`)}
                                                        >
                                                            عرض الإجابات
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        className="ml-2 bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs py-1 px-3 rounded shadow-none"
                                                        onClick={() => navigate(`/quizzes/${quiz.id}/solve`)}
                                                    >
                                                        حل الاختبار
                                                    </Button>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div className="text-xs text-gray-400 mt-2">لا يوجد اختبارات بعد.</div>
                            )}
                        </div>
                        {/* حساب متوسط نتيجة الدورة */}
                        {quizzes[course.id]?.length && (
                            <div className="mt-3 text-sm text-blue-900 font-bold flex gap-2 items-center">
                                متوسط نتائج الدورة:&nbsp;
                                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-extrabold">
                                    {
                                        (() => {
                                            const vals = quizzes[course.id].map(q => results[q.id]?.score).filter(v => v != null);
                                            return vals.length
                                                ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) + "%"
                                                : "لا يوجد نتيجة";
                                        })()
                                    }
                                </span>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
