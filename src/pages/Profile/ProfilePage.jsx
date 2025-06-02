import { useAuth } from "../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import BackButton from "../../components/ui/BackButton";
import AvatarUpload from "./AvatarUpload";
import { LogOut } from "lucide-react";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

export default function ProfilePage() {
  const { user, profile, signOut, loading, refreshProfile } = useAuth();
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingSpinner text="تحميل بيانات ..." />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white text-xl">تعذر جلب بيانات المستخدم.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex flex-col items-center justify-center px-2">
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-6 items-center relative border-t-4 border-orange-200 mt-10 mb-10">
        <BackButton />
        {/* صورة المستخدم مع زر رفع */}
        <div className="flex flex-col items-center gap-2 -mt-12">
          <AvatarUpload
            userId={user.id}
            avatarUrl={profile.avatar_url}
            onUploaded={() => {
              setAvatarVersion(Date.now());
              refreshProfile();
            }}
            className="w-28 h-28 shadow-lg border-4 border-orange-200 rounded-full bg-orange-50"
          />
        </div>
        <h2 className="text-2xl font-extrabold text-orange-600 mt-1 mb-1 tracking-tight">ملفك الشخصي</h2>
        {/* بيانات المستخدم */}
        <div className="w-full flex flex-col gap-3 text-slate-900 bg-orange-50/50 rounded-xl p-5 shadow-inner">
          <InfoItem label="الاسم" value={profile.full_name} />
          <InfoItem label="البريد" value={user.email} />
          <InfoItem label="الدور" value={profile.role === "teacher" ? "معلم" : "طالب"} />
          {profile.specialization && <InfoItem label="التخصص" value={profile.specialization} />}
          {profile.birth_date && <InfoItem label="تاريخ الميلاد" value={profile.birth_date} />}
        </div>
        {/* الأزرار */}
        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={() => navigate("/profile/edit")}
            className="w-full"
          >
            تعديل البيانات الشخصية
          </Button>
          <Button
            onClick={() => navigate("/profile/password")}
            className="w-full"
          >
            تغيير كلمة المرور
          </Button>
          <Button
            onClick={signOut}
            className="w-full bg-slate-950 text-orange-400 hover:bg-slate-800 flex items-center justify-center gap-1 font-bold"
          >
            <LogOut size={18} />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="flex items-center gap-2 text-base sm:text-lg">
      <span className="font-bold text-orange-500">{label}:</span>
      <span className="break-all">{value}</span>
    </div>
  );
}
