import { useAuth } from "../../contexts/AuthProvider";
import { useGlobalData } from "../../contexts/GlobalDataProvider";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { BookOpen, Users, Settings, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TeacherDashboard() {
    const { profile, user, loading: userLoading } = useAuth();
    const { courses, coursesLoading } = useGlobalData();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([
        { id: 1, text: "تم إضافة تقييم جديد على دورتك 'البرمجة الحديثة'." },
        { id: 2, text: "طالب جديد انضم إلى دورة الرياضيات المتقدمة." },
    ]);

    // دورات المعلم فقط
    const myCourses = useMemo(() => (courses || []).filter((c) => c.teacher_id === user?.id), [courses, user]);
    // إجمالي الطلاب
    const totalStudents = useMemo(() => myCourses.reduce((sum, c) => sum + (c.students_count || 0), 0), [myCourses]);
    // إجمالي الاختبارات
    const totalQuizzes = useMemo(() => myCourses.reduce((sum, c) => sum + (c.quizzes_count || 0), 0), [myCourses]);
    // إجمالي التقييمات
    const totalRatings = useMemo(() => myCourses.reduce((sum, c) => sum + (c.ratings_count || 0), 0), [myCourses]);

    // بيانات لمخطط الأعمدة
    const chartData = myCourses.map((c) => ({
        name: c.title.length > 12 ? c.title.slice(0, 12) + "..." : c.title,
        الطلاب: c.students_count,
        التقييمات: c.ratings_count,
    }));

    useEffect(() => {
        if (!userLoading && !user) navigate("/login", { replace: true });
    }, [user, userLoading, navigate]);

    if (userLoading || coursesLoading) {
        return <LoadingSpinner text="تحميل لوحة التحكم للمعلم..." />;
    }

    return (
        <div className="min-h-screen noto bg-slate-100 pt-24 flex flex-col items-center px-2">
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
                <Settings size={48} className="text-orange-400 mb-1" />
                <h1 className="text-2xl font-bold text-orange-600">مرحبًا أ. {profile?.full_name} 👋</h1>
                <div className="text-gray-600 text-base mb-2">إدارة دوراتك وتفاعل الطلاب معك من هنا!</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full my-4">
                    <StatCard icon={<BookOpen size={28} />} label="عدد الدورات" value={myCourses.length} color="bg-orange-50" />
                    <StatCard icon={<Users size={28} />} label="عدد الطلاب" value={totalStudents || "-"} color="bg-orange-50" />
                    <StatCard icon={<Settings size={28} />} label="الاختبارات" value={totalQuizzes || "-"} color="bg-orange-50" />
                    <StatCard icon={<Settings size={28} />} label="التقييمات" value={totalRatings || "-"} color="bg-orange-50" />
                </div>
                {/* رسم بياني إحصائي */}
                <div className="w-full h-64 bg-slate-50 rounded-xl shadow mb-4 p-2">
                    <span className="text-xs font-bold text-orange-400 px-2">إحصائيات الدورات</span>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="الطلاب" />
                            <Bar dataKey="التقييمات" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {/* أزرار الإدارة */}
                <div className="flex gap-4 mt-3 flex-wrap justify-center">
                    <button onClick={() => navigate("/courses")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg shadow transition">إدارة الدورات</button>
                    <button onClick={() => navigate("/categories")} className="bg-blue-950 hover:bg-blue-900 text-white font-bold px-4 py-2 rounded-lg shadow transition">إدارة التصنيفات</button>
                    <button onClick={() => navigate("/profile")} className="bg-gray-200 hover:bg-gray-300 text-slate-900 font-bold px-4 py-2 rounded-lg shadow transition">الملف الشخصي</button>
                </div>
                {/* ملاحظات سريعة */}
                <div className="mt-6 w-full bg-blue-50 text-blue-900 p-3 rounded-xl text-sm shadow">
                    تلميح: يمكنك دائمًا تتبع نتائج طلابك من قائمة الدورات ومتابعة تقدمهم في الاختبارات مباشرة.
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
