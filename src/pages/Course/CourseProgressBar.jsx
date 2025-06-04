import { useEffect } from "react";
import { useCourseContent } from "../../contexts/CourseContentContext";
import { useProgress } from "../../contexts/ProgressContext";
import { CheckCircle, Clock } from "lucide-react";

export default function CourseProgressBar({ userId, courseId }) {
    const {
        sectionsMap,
        contentsMap,
        quizzesMap,
        assignmentsMap,
        loading: contentLoading,
    } = useCourseContent();

    const {
        userProgress,
        fetchUserProgress,
        isSectionCompleted,
        calculateCourseProgress,
    } = useProgress();

    // تحميل التقدم عند تغيير المستخدم أو الدورة
    useEffect(() => {
        if (userId && courseId) fetchUserProgress(userId, courseId);
    }, [userId, courseId, fetchUserProgress]);

    // الأقسام وكل التفاصيل التابعة لها
    const sections = sectionsMap[courseId] || [];
    const sectionsData = sections.map(sec => ({
        sectionId: sec.id,
        title: sec.title,
        contentIds: (contentsMap[sec.id] || []).map(c => c.id),
        quizIds: (quizzesMap[sec.id] || []).map(q => q.id),
        assignmentIds: (assignmentsMap[sec.id] || []).map(a => a.id),
    }));

    // حساب النسبة
    const percent = calculateCourseProgress(sectionsData);

    // اللون حسب النسبة
    let progressColor = "bg-red-500";
    if (percent >= 80) progressColor = "bg-green-500";
    else if (percent >= 40) progressColor = "bg-orange-500";

    if (contentLoading) return <div>جاري تحميل البيانات...</div>;
    if (!sections.length) return <div>لا يوجد أقسام في هذه الدورة بعد.</div>;

    return (
        <div className="w-full max-w-4xl mx-auto bg-white p-5 rounded-2xl shadow mb-8">
            <div className="mb-2 font-bold text-lg text-slate-800 flex items-center gap-2">
                تقدمك في هذه الدورة
            </div>
            <div className="w-full h-7 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                    className={`h-7 ${progressColor} rounded-full transition-all`}
                    style={{ width: `${percent}%`, minWidth: percent > 0 ? "2rem" : "0" }}
                ></div>
            </div>
            <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-xl text-slate-800">{percent}%</span>
                <span className={`text-sm font-bold ${percent >= 80
                        ? "text-green-600"
                        : percent >= 40
                            ? "text-orange-600"
                            : "text-red-600"
                    }`}>
                    {percent === 100
                        ? "أحسنت! أنجزت الدورة كاملة 🎉"
                        : percent >= 80
                            ? "شارفـت على الانتهاء!"
                            : percent >= 40
                                ? "تقدم جيد! استمر 👏"
                                : "بإمكانك بذل المزيد 💪"}
                </span>
            </div>
            <ul className="mt-4 space-y-2">
                {sectionsData.map(sec => (
                    <li key={sec.sectionId} className="flex items-center gap-2">
                        <span className="font-bold text-base text-orange-700">{sec.title}</span>
                        {isSectionCompleted(sec) ? (
                            <CheckCircle className="text-green-600" size={22} />
                        ) : (
                            <Clock className="text-orange-400" size={22} />
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
