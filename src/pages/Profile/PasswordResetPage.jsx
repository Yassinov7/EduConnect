import { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import BackButton from "../../components/ui/BackButton";

export default function PasswordResetPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("تأكيد كلمة المرور غير متطابق");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("تم تغيير كلمة المرور بنجاح");
      setNewPassword("");
      setConfirm("");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md flex flex-col gap-4">
        <BackButton />
        <h2 className="text-xl font-bold text-orange-500 mb-2">
          تغيير كلمة المرور
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleReset}>
          <Input
            label="كلمة المرور الجديدة"
            icon={Lock}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="تأكيد كلمة المرور"
            icon={Lock}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "جاري التغيير..." : "تغيير كلمة المرور"}
          </Button>
        </form>
      </div>
    </div>
  );
}
