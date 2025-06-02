import { useState } from "react";
import Button from "../../components/ui/Button";
import { supabase } from "../../services/supabaseClient";
import { toast } from "sonner";
import { User, Briefcase, Calendar } from "lucide-react";
import { useAuth } from "../../contexts/AuthProvider";

export default function PersonalDetailsForm({ profile, onSaved }) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [specialization, setSpecialization] = useState(profile.specialization || "");
  const [birthDate, setBirthDate] = useState(profile.birth_date || "");
  const [loading, setLoading] = useState(false);

  const { user, refreshProfile } = useAuth();

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        specialization,
        birth_date: birthDate || null,
      })
      .eq("user_id", user.id);

    setLoading(false);
    if (error) {
      toast.error("حدث خطأ أثناء التحديث");
    } else {
      toast.success("تم حفظ التعديلات");
      await refreshProfile();
      if (onSaved) onSaved();
    }
  }

  return (
    <form className="flex flex-col gap-4 mt-4 w-full" onSubmit={handleSave}>
      <label className="flex flex-col gap-1">
        <span className="text-slate-600 font-bold text-sm pr-1">الاسم الكامل</span>
        <div className="relative">
          <User className="absolute left-3 top-3 text-orange-400" size={20} />
          <input
            className="w-full border border-orange-200 rounded-xl pl-4 pr-10 py-2 bg-orange-50 focus:border-orange-400 transition text-slate-700 font-bold outline-none shadow-sm"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-slate-600 font-bold text-sm pr-1">التخصص</span>
        <div className="relative">
          <Briefcase className="absolute left-3 top-3 text-orange-400" size={20} />
          <input
            className="w-full border border-orange-200 rounded-xl pl-4 pr-10 py-2 bg-orange-50 focus:border-orange-400 transition text-slate-700 font-bold outline-none shadow-sm"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="مثلاً: مدرس رياضيات"
          />
        </div>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-slate-600 font-bold text-sm pr-1">تاريخ الميلاد</span>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 text-orange-400" size={20} />
          <input
            type="date"
            className="w-full border border-orange-200 rounded-xl pl-4 pr-10 py-2 bg-orange-50 focus:border-orange-400 transition text-slate-700 font-bold outline-none shadow-sm"
            value={birthDate || ""}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
      </Button>
    </form>
  );
}
