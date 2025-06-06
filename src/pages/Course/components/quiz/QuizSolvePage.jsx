import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import { useAuth } from "../../../../contexts/AuthProvider";
import { CheckCircle, XCircle, BadgeX, CircleCheckBigIcon } from "lucide-react";
import { useQuizData } from "../../../../contexts/QuizDataProvider";
import { useProgress } from "../../../../contexts/ProgressContext"; // 1. استيراد السياق

export default function QuizSolvePage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { markQuizCompleted } = useProgress(); // 2. استخراج دالة التقدم

  const {
    fetchQuiz,
    fetchQuizQuestions,
    fetchStudentQuizAnswers,
    submitQuizAnswers,
    questionsMap,
    loading
  } = useQuizData();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [previousAnswers, setPreviousAnswers] = useState(null);

  // جلب بيانات الاختبار والأسئلة
  useEffect(() => {
    if (!quizId || !user) return;
    (async () => {
      setResult(null);
      setCurrentIndex(0);
      setAnswers({});
      setPreviousAnswers(null);
      const quizData = await fetchQuiz(quizId);
      setQuiz(quizData);

      await fetchQuizQuestions(quizId);
      const prev = await fetchStudentQuizAnswers(quizId, user.id);
      if (prev && prev.length > 0) setPreviousAnswers(prev);
    })();
    // eslint-disable-next-line
  }, [quizId, user?.id]);

  // حساب النتيجة إذا وجد إجابات سابقة
  useEffect(() => {
    const questions = questionsMap[quizId] || [];
    if (previousAnswers && questions.length) {
      let correctCount = 0;
      questions.forEach(q => {
        const ans = previousAnswers.find(a => a.question_id === q.id);
        if (ans && ans.selected_option === q.correct_option) correctCount++;
      });
      setResult({
        correct: correctCount,
        total: questions.length,
        percent: Math.round((correctCount / questions.length) * 100),
        detail: previousAnswers,
      });
    }
  }, [previousAnswers, questionsMap, quizId]);

  // دالة إرسال الإجابات
  async function handleSubmit(e) {
    e.preventDefault();
    const questions = questionsMap[quizId] || [];
    if (Object.keys(answers).length !== questions.length) {
      alert("أجب على جميع الأسئلة أولاً.");
      return;
    }
    setSubmitting(true);

    const res = await submitQuizAnswers(quizId, user.id, questions, answers);
    setSubmitting(false);

    if (res.alreadySolved) {
      alert("لقد قمت بحل هذا الاختبار من قبل.");
      return;
    }
    if (res && !res.error) {
      setResult(res);

      // === هنا يتم تسجيل التقدم بعد حل الاختبار ===
      if (
        quiz &&
        quiz.id &&
        quiz.section_id &&
        quiz.section &&
        quiz.section.course_id
      ) {
        await markQuizCompleted(
          user.id,
          quiz.section.course_id, // courseId
          quiz.section_id,        // sectionId
          quiz.id                 // quizId
        );
      }
      // === انتهى ===
    } else {
      alert("حدث خطأ أثناء حفظ الإجابات!");
    }
  }

  // ... باقي الكود كما هو بدون تعديل ...

  // تحميل أو لا يوجد بيانات
  const questions = questionsMap[quizId] || [];
  if (loading || !quiz) {
    return <div className="py-10 text-center text-xl">جاري التحميل...</div>;
  }

  if (!questions.length) {
    return (
      <div className="py-10 text-center text-lg text-gray-500">
        لا يوجد أسئلة في هذا الاختبار حتى الآن.
      </div>
    );
  }

  // عرض النتيجة النهائية إذا الطالب حل الاختبار بالفعل
  if (result) {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-8 flex flex-col items-center">
        <h2 className="text-2xl font-extrabold text-orange-600 mb-4">نتيجتك النهائية</h2>
        <div className="text-xl font-bold text-slate-900 mb-2">
          الدرجة: {result.correct} / {result.total}
        </div>
        <div className="text-xl font-bold text-slate-900 mb-2">
          النسبة: {result.percent}%
        </div>
        <div className={`text-lg font-bold px-4 py-2 rounded-xl ${result.percent >= 60 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {result.percent >= 60 ? "ناجح" : "راسب"}
        </div>
        <div className={`text-lg font-bold px-4 py-2 rounded-xl ${result.percent >= 60 ? "text-green-800" : " text-red-800"}`}>
          {result.percent >= 60 ? <CircleCheckBigIcon size={30} /> : <BadgeX size={30} />}
        </div>
        <div className="w-full mt-8">
          <h3 className="font-bold mb-3 text-slate-800 text-center">تفاصيل الإجابات:</h3>
          {questions.map((q, idx) => {
            const ans = (result.detail || []).find(a => a.question_id === q.id);
            const selected = ans?.selected_option;
            const correct = q.correct_option;
            const isCorrect = selected === correct;
            return (
              <div key={q.id} className="mb-5 bg-blue-50 px-5 py-3 rounded-xl shadow-sm border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-base text-slate-800">{idx + 1}. {q.question_text}</span>
                  {isCorrect
                    ? <CheckCircle size={20} className="text-green-500" />
                    : <XCircle size={20} className="text-red-500" />
                  }
                </div>
                <div className="grid gap-1 pl-7">
                  {["a", "b", "c", "d"].map(opt => (
                    <div key={opt} className={`
                                            flex items-center gap-2 rounded px-2 py-1
                                            ${correct === opt && !isCorrect ? "bg-green-100 text-green-700 font-bold" : ""}
                                            ${selected === opt && selected !== correct ? "bg-red-100 text-red-700" : ""}
                                            ${selected === opt && selected === correct ? "bg-green-100 text-green-700 font-bold" : ""}
                                        `}>
                      <span className="font-bold">{opt.toUpperCase()}.</span>
                      <span>{q[`option_${opt}`]}</span>
                      {selected === opt && <span className="text-xs ml-2">(إجابتك)</span>}
                      {correct === opt && <span className="text-xs ml-2">(الصحيحة)</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <Button className="mt-7 bg-blue-950 text-white" onClick={() => navigate(-1)}>
          العودة
        </Button>
      </div>
    );
  }

  // عرض السؤال الحالي فقط مع حماية
  const currentQ = questions[currentIndex];
  if (!currentQ) {
    return (
      <div className="py-10 text-center text-lg text-gray-500">
        لا يوجد سؤال في هذا الاختبار.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-lg mt-6 flex flex-col gap-7">
      <div className="mb-3 text-2xl font-extrabold text-blue-950">
        اختبار: <span className="text-orange-600">{quiz.title}</span>
      </div>
      <div className="flex flex-col gap-5">
        <div className="bg-blue-50 rounded-xl p-5 shadow-sm border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-lg text-slate-900">{currentIndex + 1}. {currentQ.question_text}</span>
          </div>
          <div className="grid gap-2 mt-2">
            {["a", "b", "c", "d"].map(opt => (
              <label key={opt} className={`
                                flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition font-medium
                                ${answers[currentQ.id] === opt
                  ? "bg-orange-200 border border-orange-500 text-orange-900 shadow"
                  : "bg-white border border-slate-200 hover:bg-orange-50"
                }`
              }>
                <input
                  type="radio"
                  name={`q${currentQ.id}`}
                  value={opt}
                  checked={answers[currentQ.id] === opt}
                  onChange={() => setAnswers(ans => ({ ...ans, [currentQ.id]: opt }))}
                  className="accent-orange-600 w-5 h-5"
                  required
                />
                <span>{currentQ[`option_${opt}`]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-4 justify-between mt-2">
        <Button
          type="button"
          className="bg-gray-100 text-slate-900 rounded-xl font-bold px-6 py-2 hover:bg-orange-50 border border-slate-200 shadow"
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          السابق
        </Button>
        {currentIndex < questions.length - 1 ? (
          <Button
            type="button"
            className="bg-orange-500 text-white rounded-xl font-bold px-6 py-2 hover:bg-orange-600 shadow"
            onClick={() => {
              if (!answers[currentQ.id]) {
                alert("اختر إجابة قبل الانتقال للسؤال التالي.");
                return;
              }
              setCurrentIndex(i => i + 1);
            }}
          >
            التالي
          </Button>
        ) : (
          <Button
            type="submit"
            className="bg-orange-600 text-white rounded-xl font-bold px-6 py-2 hover:bg-orange-700 shadow"
            disabled={submitting || !answers[currentQ.id]}
          >
            {submitting ? "جارٍ الإرسال..." : "إرسال الإجابات"}
          </Button>
        )}
      </div>
      <div className="text-center text-sm text-gray-400 mt-2">
        سؤال {currentIndex + 1} من {questions.length}
      </div>
    </form>
  );
}
