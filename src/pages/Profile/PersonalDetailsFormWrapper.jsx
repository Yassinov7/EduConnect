// src/pages/Profile/PersonalDetailsFormWrapper.jsx
import { useAuth } from "../../contexts/AuthProvider"; // السياق الجديد
import { useNavigate } from "react-router-dom";
import PersonalDetailsForm from "./PersonalDetailsForm";
import BackButton from "../../components/ui/BackButton";

export default function PersonalDetailsFormWrapper() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        ...جاري التحميل
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md flex flex-col gap-4 items-center">
        <BackButton />
        <h2 className="text-2xl font-bold text-orange-500 mb-4">تعديل البيانات الشخصية</h2>
        <PersonalDetailsForm
          profile={profile}
          onSaved={async () => {
            // بعد الحفظ: جلب آخر بيانات من السياق
            await refreshProfile();
            navigate("/profile");
          }}
        />
      </div>
    </div>
  );
}
