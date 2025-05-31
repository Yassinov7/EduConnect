import { useState } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { User, Mail, Lock, UserRound } from "lucide-react";
import BackButton from "../../components/ui/BackButton";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signUp({
      email,
      password,
      full_name: fullName,
      role,
    });

    setLoading(false);
    if (error) {
      setError(error.message || "حدث خطأ أثناء إنشاء الحساب.");
      return;
    }

    toast.success("تم انشاء الحساب! تفقد بريدك لتأكيد الحساب ثم قم بتسجيل الدخول.");
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow flex flex-col gap-4">
        <BackButton />
        <h2 className="text-2xl font-bold text-orange-500 mb-3 flex items-center gap-2">
          <UserRound size={28} /> إنشاء حساب جديد
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleRegister}>
          <Input
            label="الاسم الكامل"
            icon={User}
            placeholder="اكتب اسمك هنا"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="البريد الإلكتروني"
            icon={Mail}
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="كلمة المرور"
            icon={Lock}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div>
            <label className="text-slate-900 font-bold">نوع الحساب</label>
            <select
              className="border rounded px-3 py-2 w-full mt-1 bg-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">طالب</option>
              <option value="teacher">معلم</option>
            </select>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري التسجيل..." : "تسجيل"}
          </Button>
          <Link to="/login" className="text-orange-500 text-center hover:underline">
            لديك حساب؟ دخول
          </Link>
        </form>
      </div>
    </div>
  );
}
