// src/pages/Dashboard/DashboardPage.jsx
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
    const { user, loading: userLoading, signOut } = useAuth();
    const { profile, loading: profileLoading } = useProfile(user?.id);
    const navigate = useNavigate();

    if (userLoading || profileLoading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-white text-xl">...جاري التحميل</div>
            </div>
        );

    if (!user) {
        navigate("/login");
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow w-full max-w-md flex flex-col gap-6 items-center">
                <h1 className="text-2xl font-bold text-orange-500 mb-2">
                    مرحبًا {profile?.full_name || "مستخدم"}!
                </h1>
                <div className="text-slate-700 text-lg">
                    أنت مسجّل كـ <span className="font-bold">{profile?.role === "teacher" ? "معلم" : "طالب"}</span>
                </div>
        
                <Button
                    onClick={() => navigate("/profile")}
                    className="w-full bg-blue-950 hover:bg-blue-900 mt-2"
                >
                    ملفي الشخصي
                </Button>

                <Button onClick={signOut} className="w-full mt-6">
                    تسجيل الخروج
                </Button>
            </div>
        </div>
    );
}
