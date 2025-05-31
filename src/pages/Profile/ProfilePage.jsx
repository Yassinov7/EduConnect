// src/pages/Profile/ProfilePage.jsx
import { useAuth } from "../../contexts/AuthProvider"; // استدعاء السياق الجديد
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import BackButton from "../../components/ui/BackButton";
import AvatarUpload from "./AvatarUpload";

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
    <div className="min-h-screen bg-slate-950/50 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-5 items-center relative">
        <BackButton />
        {/* صورة المستخدم مع زر رفع */}
        <AvatarUpload
          userId={user.id}
          avatarUrl={profile.avatar_url}
          onUploaded={() => {
            setAvatarVersion(Date.now());
            refreshProfile(); // نضمن جلب آخر تحديث
          }}
        />
        <h2 className="text-2xl font-bold text-orange-500 mt-2">ملفك الشخصي</h2>
        <div className="w-full flex flex-col gap-2 text-slate-900 bg-gray-50 rounded-xl p-4 shadow-inner">
          <InfoItem label="الاسم" value={profile.full_name} />
          <InfoItem label="البريد" value={user.email} />
          <InfoItem label="الدور" value={profile.role === "teacher" ? "معلم" : "طالب"} />
          {profile.specialization && <InfoItem label="التخصص" value={profile.specialization} />}
          {profile.birth_date && <InfoItem label="تاريخ الميلاد" value={profile.birth_date} />}
        </div>
        <Button
          onClick={() => navigate("/profile/edit")}
          className="w-full mt-2"
        >
          تعديل البيانات الشخصية
        </Button>
        <Button
          onClick={() => navigate("/profile/password")}
          className="w-full"
        >
          تغيير كلمة المرور 
        </Button>
        <Button onClick={signOut} className="w-full bg-slate-950 text-orange-500 hover:bg-slate-800 mt-2">
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold text-orange-500">{label}:</span>
      <span>{value}</span>
    </div>
  );
}
