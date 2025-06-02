import { useAuth } from "../../contexts/AuthProvider";
import { useTeacherDashboardData } from "../../contexts/TeacherDashboardDataProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { BookOpen, Users, ChartBar, Star, ExternalLink } from "lucide-react";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const PIE_COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f59e42", "#818cf8", "#4ade80"];

export default function TeacherDashboard() {
  const { profile, user, loading: userLoading } = useAuth();
  const navigate = useNavigate();
  const {
    loading: dashboardLoading,
    courses,
    sectionsMap,
    quizzesMap,
    ratingsMap,
  } = useTeacherDashboardData();

  useEffect(() => {
    if (!userLoading && !user) navigate("/login", { replace: true });
  }, [user, userLoading, navigate]);

  if (userLoading) return <LoadingSpinner text="تحميل بيانات المستخدم ..." />;
  if (dashboardLoading) return <LoadingSpinner text="تحميل لوحة التحكم..." />;

  const totalCourses = courses.length;
  const totalStudents = courses.reduce((acc, c) => acc + (c.course_enrollments?.length || 0), 0);
  const totalQuizzes = courses.reduce((sum, c) => {
    const sections = sectionsMap[c.id] || [];
    return sum + sections.reduce((secSum, s) => secSum + (quizzesMap[s.id]?.length || 0), 0);
  }, 0);

  const avgRating = (() => {
    const values = Object.values(ratingsMap);
    const valid = values.filter(r => r.avg !== "—");
    if (!valid.length) return "—";
    const total = valid.reduce((sum, r) => sum + parseFloat(r.avg), 0);
    return (total / valid.length).toFixed(1);
  })();

  const chartData = courses.map(c => {
    const rating = ratingsMap[c.id]?.avg || 0;
    return {
      name: c.title.length > 14 ? c.title.slice(0, 14) + "..." : c.title,
      التقييم: parseFloat(rating),
    };
  });

  // PieChart Data: توزيع الطلاب على الدورات
  const pieData = courses.map((course) => ({
    name: course.title.length > 12 ? course.title.slice(0, 12) + "..." : course.title,
    value: course.course_enrollments?.length || 0,
  })).filter(item => item.value > 0);

  return (
    <div className="min-h-screen noto bg-slate-100 pt-24 pb-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col gap-6">

        {/* الترحيب */}
        <Card>
          <h1 className="text-2xl font-bold text-orange-600">مرحبًا أ. {profile?.full_name} 👋</h1>
          <p className="text-slate-600">ألق نظرة على أداء دوراتك وطلابك. وتابع إحصائياتك التفاعلية!</p>
        </Card>

        {/* الإحصائيات المختصرة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="flex flex-col items-center justify-center">
            <StatCard icon={<BookOpen size={28} />} label="الدورات" value={totalCourses} />
          </Card>
          <Card className="flex flex-col items-center justify-center">
            <StatCard icon={<Users size={28} />} label="الطلاب" value={totalStudents} />
          </Card>
          <Card className="flex flex-col items-center justify-center">
            <StatCard icon={<ChartBar size={28} />} label="الاختبارات" value={totalQuizzes} />
          </Card>
          <Card className="flex flex-col items-center justify-center">
            <StatCard icon={<Star size={28} />} label="متوسط تقييمات دوراتك" value={avgRating} />
          </Card>
        </div>

        {/* روابط الإدارة */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={() => navigate("/courses")}>إدارة الدورات</Button>
          <Button onClick={() => navigate("/categories")} >إدارة التصنيفات</Button>
          <Button onClick={() => navigate("/profile")} >الملف الشخصي</Button>
        </div>
        {/* مخطط بياني: توزيع الطلاب على الدورات */}
        {pieData.length > 0 && (
          <Card>
            <h3 className="text-sm font-bold text-orange-500 mb-2">توزيع الطلاب على الدورات</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* عرض الدورات */}
        <Card>
          <h2 className="text-sm font-bold text-orange-500 mb-3">دوراتك الحالية</h2>
          <ul className="space-y-3">
            {courses.length === 0 && (
              <li className="text-center text-gray-400 py-8">لا يوجد دورات بعد</li>
            )}
            {courses.map((course) => (
              <li
                key={course.id}
                className="flex items-center justify-between bg-slate-50 rounded-xl p-4 shadow-sm hover:bg-orange-50 transition"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="text-slate-800 font-semibold">{course.title}</span>
                  <span className="text-sm text-slate-500">
                    طلاب: {course.course_enrollments?.length || 0} — تقييم: {ratingsMap[course.id]?.avg || "—"}
                  </span>
                </div>
                <Button
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="flex items-center gap-1  !bg-orange-100 !text-orange-700 !hover:bg-orange-200 !shadow-none"
                >
                  <ExternalLink size={20} /> الذهاب للدورة
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        {/* الرسم البياني - التقييمات */}
        <Card>
          <h3 className="text-sm font-bold text-orange-500 mb-2">مخطط تقييمات الدورات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="التقييم" fill="#f97316" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <>
      <div className="mb-1">{icon}</div>
      <div className="text-2xl font-bold text-orange-600">{value}</div>
      <div className="text-gray-700 text-sm">{label}</div>
    </>
  );
}
