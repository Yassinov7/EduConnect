// src/pages/Profile/PersonalDetailsForm.jsx
import { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { supabase } from "../../services/supabaseClient";
import { toast } from "sonner";
import { User, Briefcase, Calendar } from "lucide-react";
import { useAuth } from "../../contexts/AuthProvider"; // إضافة السياق

export default function PersonalDetailsForm({ profile, onSaved }) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [specialization, setSpecialization] = useState(profile.specialization || "");
  const [birthDate, setBirthDate] = useState(profile.birth_date || "");
  const [loading, setLoading] = useState(false);

  const { user, refreshProfile } = useAuth(); // استخدام السياق لجلب المستخدم وتحديث البيانات

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
      .eq("user_id", user.id); // نستخدم user.id مباشرة من السياق

    setLoading(false);
    if (error) {
      toast.error("حدث خطأ أثناء التحديث");
    } else {
      toast.success("تم حفظ التعديلات");
      await refreshProfile(); // تحديث البروفايل بالسياق
      if (onSaved) onSaved();
    }
  }

  return (
    <form className="flex flex-col gap-4 mt-4" onSubmit={handleSave}>
      <Input
        label="الاسم الكامل"
        icon={User}
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <Input
        label="التخصص"
        icon={Briefcase}
        value={specialization}
        onChange={(e) => setSpecialization(e.target.value)}
        placeholder="مثلاً: مدرس رياضيات"
      />
      <Input
        label="تاريخ الميلاد"
        icon={Calendar}
        type="date"
        value={birthDate || ""}
        onChange={(e) => setBirthDate(e.target.value)}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
      </Button>
    </form>
  );
}
