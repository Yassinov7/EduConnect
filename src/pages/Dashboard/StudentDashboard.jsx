import { useAuth } from "../../contexts/AuthProvider";
import { useGlobalData } from "../../contexts/GlobalDataProvider";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { BookOpen, Trophy, UserCircle, Bell } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function StudentDashboard() {
  const { profile, user, loading: userLoading } = useAuth();
  const { courses, coursesLoading } = useGlobalData();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    { id: 1, text: "تم إضافة اختبار جديد في دورة 'البرمجة الحديثة'." },
    { id: 2, text: "أحرزت تقدمًا في دورة اللغة الإنجليزية! 👏" },
  ]);

  // دورات الطالب الملتحق بها
  const myCourses = useMemo(() => (courses || []).filter((c) => (c.enrolled_users_ids || []).includes(user?.id)), [courses, user]);
  // الدورات المكتملة
  const completedCourses = useMemo(() => myCourses.filter(c => (c.completed_users_ids || []).includes(user?.id)), [myCourses, user]);
  // احصائيات الاختبارات
  const quizResults = useMemo(() => {
    // تحتاج لجلب بيانات نتائج الاختبارات للطالب من backend أو سياق
    // هنا مثال بيانات وهمية:
    return [
      { quiz: "اختبار 1", score: 75 },
      { quiz: "اختبار 2", score: 90 },
      { quiz: "اختبار 3", score: 65 }
    ];
  }, []);

  // متوسط النتائج
  const averageScore = quizResults.length
    ? Math.round(quizResults.reduce((sum, q) => sum + q.score, 0) / quizResults.length)
    : "-";
  // أفضل نتيجة
  const bestScore = quizResults.length ? Math.max(...quizResults.map(q => q.score)) : "-";

  // Pie chart لنتائج الاختبارات (مثال)
  const pieData = [
    { name: "المكتملة", value: completedCourses.length },
    { name: "قيد المتابعة", value: myCourses.length - completedCourses.length },
  ];
  const pieColors = ["#10b981", "#f59e42"];

  useEffect(() => {
    if (!userLoading && !user) navigate("/login", { replace: true });
  }, [user, userLoading, navigate]);

  if (userLoading || coursesLoading) {
    return <LoadingSpinner text="تحميل لوحة التحكم..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 pt-24 flex flex-col items-center px-2">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl flex flex-col gap-3 items-center">
        {/* الإشعارات */}
        <div className="flex items-center gap-2 w-full">
          <Bell className="text-orange-400" size={28} />
          <span className="font-bold text-orange-600 text-lg">الإشعارات</span>
        </div>
        <ul className="w-full mb-3 px-3">
          {notifications.length ? notifications.map(n =>
            <li key={n.id} className="text-slate-700 bg-orange-50 rounded-xl my-1 px-4 py-2">{n.text}</li>
          ) : <li className="text-slate-400">لا توجد إشعارات جديدة.</li>}
        </ul>
        {/* العنوان والإحصائيات */}
        <UserCircle size={48} className="text-orange-400 mb-1" />
        <h1 className="text-2xl font-bold text-orange-600">مرحبًا {profile?.full_name} 👋</h1>
        <div className="text-gray-600 text-base mb-2">نتمنى لك رحلة تعلّم ممتعة وناجحة في Extra Learnings!</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full my-4">
          <StatCard icon={<BookOpen size={28} />} label="دوراتي" value={myCourses.length} color="bg-orange-50" />
          <StatCard icon={<Trophy size={28} />} label="متوسط النتائج" value={averageScore + "%"} color="bg-orange-50" />
          <StatCard icon={<Trophy size={28} />} label="أفضل نتيجة" value={bestScore + "%"} color="bg-orange-50" />
          <StatCard icon={<BookOpen size={28} />} label="المكتملة" value={completedCourses.length} color="bg-orange-50" />
        </div>
        {/* مخطط دائري للتقدم */}
        <div className="w-full h-52 bg-slate-50 rounded-xl shadow mb-4 p-2 flex flex-col items-center">
          <span className="text-xs font-bold text-orange-400 px-2 mb-2">نسبة إكمال الدورات</span>
          <ResponsiveContainer width="95%" height="85%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={60}>
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={pieColors[idx]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* أزرار */}
        <div className="flex gap-4 mt-3 flex-wrap justify-center">
          <button onClick={() => navigate("/courses")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg shadow transition">الدورات</button>
          <button onClick={() => navigate("/my-results")} className="bg-blue-950 hover:bg-blue-900 text-white font-bold px-4 py-2 rounded-lg shadow transition">نتائجي</button>
          <button onClick={() => navigate("/profile")} className="bg-gray-200 hover:bg-gray-300 text-slate-900 font-bold px-4 py-2 rounded-lg shadow transition">الملف الشخصي</button>
        </div>
        {/* ملاحظات */}
        <div className="mt-6 w-full bg-blue-50 text-blue-900 p-3 rounded-xl text-sm shadow">
          نصيحة: تابع تقدمك في صفحة <b>نتائجي</b> لتتأكد من تحقيق أهدافك الدراسية!
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl shadow ${color}`}>
      <div className="mb-1">{icon}</div>
      <div className="text-2xl font-bold text-orange-500">{value}</div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  );
}
