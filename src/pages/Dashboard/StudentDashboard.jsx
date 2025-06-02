import { useAuth } from "../../contexts/AuthProvider";
import { useStudentDashboardData } from "../../contexts/StudentDashboardDataProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { BookOpen, Trophy, BookCheck, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const PIE_COLORS = ["#10b981", "#f59e42"];

export default function StudentDashboard() {
  const { profile, user, loading: userLoading } = useAuth();
  const { myCourses, completedCourses, quizStats, loading: dashboardLoading } = useStudentDashboardData();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userLoading && !user) navigate("/login", { replace: true });
  }, [user, userLoading, navigate]);

  if (userLoading || dashboardLoading) {
    return <LoadingSpinner text="تحميل لوحة التحكم..." />;
  }

  const averageScore = quizStats.percent ? quizStats.percent + "%" : "-";
  const bestScore = quizStats.byQuiz.length
    ? Math.max(...quizStats.byQuiz.map(q => q.percent)) + "%"
    : "-";

  const pieData = [
    { name: "المكتملة", value: completedCourses.length },
    { name: "قيد المتابعة", value: myCourses.length - completedCourses.length },
  ];

  return (
    <div className="min-h-screen bg-slate-100 pt-24 flex flex-col items-center px-2">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl flex flex-col gap-3 items-center">
        <h1 className="text-2xl font-bold text-orange-600 mb-2">
          مرحبًا {profile?.full_name} 👋
        </h1>
        <div className="text-gray-600 text-base mb-2">
          نتمنى لك رحلة تعلّم ممتعة وناجحة في منصتنا!
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full my-4">
          <StatCard icon={<BookOpen size={28} />} label="دوراتي" value={myCourses.length} />
          <StatCard icon={<BookCheck size={28} />} label="المكتملة" value={completedCourses.length} />
          <StatCard icon={<Trophy size={28} />} label="نسبة الإجابات الصحيحة" value={averageScore} />
          <StatCard icon={<Trophy size={28} />} label="أفضل نتيجة اختبار" value={bestScore} />
        </div>
        {/* دائرة النسبة المئوية للتقدم */}
        <div className="w-full h-52 bg-slate-50 rounded-xl shadow mb-4 p-2 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-orange-400 px-2 mb-2">نسبة إكمال الدورات</span>
          <ResponsiveContainer width="95%" height="85%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={60} label>
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/*  تووضح نتائج كل اختبار */}
        <div className="w-full mt-4">
          <h3 className="text-sm font-bold text-orange-500 mb-3">نتائج الاختبارات الأخيرة</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {quizStats.byQuiz.length === 0 ? (
              <div className="text-center text-gray-400 bg-slate-50 rounded-xl shadow p-8 w-full">
                لا توجد نتائج اختبارات حتى الآن.
              </div>
            ) : (
              quizStats.byQuiz.map(q => (
                <QuizResultCard
                  key={q.quiz_id}
                  quiz_title={q.quiz_title}
                  total={q.total}
                  correct={q.correct}
                  percent={q.percent}
                />
              ))
            )}
          </div>
        </div>
        {/* أزرار */}
        <div className="flex gap-4 mt-3 flex-wrap justify-center">
          <button onClick={() => navigate("/courses")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg shadow transition">الدورات</button>
          <button onClick={() => navigate("/profile")} className="bg-gray-200 hover:bg-gray-300 text-slate-900 font-bold px-4 py-2 rounded-lg shadow transition">الملف الشخصي</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow bg-orange-50">
      <div className="mb-1">{icon}</div>
      <div className="text-2xl font-bold text-orange-500">{value}</div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  );
}


function QuizResultCard({ quiz_title, total, correct, percent }) {
  let icon, iconColor;
  if (percent >= 80) {
    icon = <CheckCircle className="text-green-500" size={32} />;
    iconColor = "border-green-200";
  } else if (percent >= 50) {
    icon = <AlertCircle className="text-yellow-400" size={32} />;
    iconColor = "border-yellow-200";
  } else {
    icon = <XCircle className="text-red-500" size={32} />;
    iconColor = "border-red-200";
  }

  return (
    <div className={`flex flex-col items-center gap-2 bg-slate-50 rounded-xl shadow p-4 border-2 ${iconColor} transition w-full sm:w-60`}>
      <div>{icon}</div>
      <div className="text-lg font-bold text-orange-600 text-center">{quiz_title}</div>
      <div className="flex flex-col items-center text-slate-700 text-sm">
        <div>
          <span className="font-bold">عدد الأسئلة:</span> {total}
        </div>
        <div>
          <span className="font-bold">إجابات صحيحة:</span> {correct}
        </div>
      </div>
      <div className="mt-1 text-xl font-extrabold">
        {percent}%
      </div>
    </div>
  );
}
