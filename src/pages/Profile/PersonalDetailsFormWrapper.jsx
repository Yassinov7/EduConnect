import { useAuth } from "../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import PersonalDetailsForm from "./PersonalDetailsForm";
import BackButton from "../../components/ui/BackButton";

export default function PersonalDetailsFormWrapper() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 text-orange-600">
        ...جاري التحميل
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-2">
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-4 items-center border-t-4 border-orange-200">
        <BackButton />
        <h2 className="text-2xl font-bold text-orange-600 mb-2 tracking-tight">تعديل البيانات الشخصية</h2>
        <PersonalDetailsForm
          profile={profile}
          onSaved={async () => {
            await refreshProfile();
            navigate("/profile");
          }}
        />
      </div>
    </div>
  );
}
