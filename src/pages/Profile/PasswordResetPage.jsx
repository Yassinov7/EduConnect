import { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import Button from "../../components/ui/Button";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-4 border-t-4 border-orange-200">
        <BackButton />
        <h2 className="text-xl font-bold text-orange-600 mb-2">تغيير كلمة المرور</h2>
        <form className="flex flex-col gap-4" onSubmit={handleReset}>
          <label className="flex flex-col gap-1">
            <span className="text-slate-600 font-bold text-sm pr-1">كلمة المرور الجديدة</span>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-orange-400" size={20} />
              <input
                type="password"
                className="w-full border border-orange-200 rounded-xl pl-4 pr-10 py-2 bg-orange-50 focus:border-orange-400 transition text-slate-700 font-bold outline-none shadow-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-slate-600 font-bold text-sm pr-1">تأكيد كلمة المرور</span>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-orange-400" size={20} />
              <input
                type="password"
                className="w-full border border-orange-200 rounded-xl pl-4 pr-10 py-2 bg-orange-50 focus:border-orange-400 transition text-slate-700 font-bold outline-none shadow-sm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? "جاري التغيير..." : "تغيير كلمة المرور"}
          </Button>
        </form>
      </div>
    </div>
  );
}
