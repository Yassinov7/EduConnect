// src/pages/Dashboard/DashboardRouter.jsx
import { useAuth } from "../contexts/AuthProvider";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import StudentDashboard from "../pages/Dashboard/StudentDashboard";
import TeacherDashboard from "../pages/Dashboard/TeacherDashboard";

export default function DashboardRouter() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="تحميل لوحة التحكم..." />;
  }
  if (!user || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-950">
        <div className="bg-white text-red-600 px-8 py-7 rounded-2xl shadow text-lg font-bold">
          لم يتم العثور على بيانات المستخدم! يرجى تسجيل الدخول مجددًا.
        </div>
      </div>
    );
  }

  if (profile.role === "teacher") {
    return <TeacherDashboard profile={profile} />;
  }
  return <StudentDashboard profile={profile} />;
}
