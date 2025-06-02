import { useState } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { User, Mail, Lock, UserRound, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-orange-50 via-white to-orange-100">
      <div className="w-full max-w-md p-8 sm:p-10 bg-white rounded-3xl shadow-2xl flex flex-col gap-5 border-t-4 border-orange-200 relative">
        {/* زر العودة */}
        <button
          onClick={() => window.history.back()}
          className="absolute right-4 top-4 flex items-center gap-1 text-orange-400 hover:text-orange-600 font-bold text-sm"
        >
          <ArrowRight size={20} /> رجوع
        </button>

        <div className="flex flex-col items-center gap-2 mb-2">
          <UserRound size={38} className="text-orange-500" />
          <h2 className="text-2xl font-extrabold text-orange-600 tracking-tight">إنشاء حساب جديد</h2>
        </div>
        <form className="flex flex-col gap-4 mt-2" onSubmit={handleRegister}>
          {/* الاسم الكامل */}
          <label className="flex flex-col gap-1">
            <span className="text-slate-600 font-bold text-sm pr-1">الاسم الكامل</span>
            <div className="relative">
              <User className="absolute left-3 top-3 text-orange-400" size={20} />
              <input
                type="text"
                className="w-full border border-orange-200 rounded-xl pl-4 pr-10 py-2 bg-orange-50 focus:border-orange-400 transition text-slate-700 font-bold outline-none shadow-sm"
                placeholder="اكتب اسمك هنا"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
          </label>

          {/* البريد الإلكتروني */}
          <label className="flex flex-col gap-1">
            <span className="text-slate-600 font-bold text-sm pr-1">البريد الإلكتروني</span>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-orange-400" size={20} />
              <input
                type="email"
                className="w-full border border-orange-200 rounded-xl pl-4 pr-10 py-2 bg-orange-50 focus:border-orange-400 transition text-slate-700 font-bold outline-none shadow-sm"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </label>

          {/* كلمة المرور */}
          <label className="flex flex-col gap-1">
            <span className="text-slate-600 font-bold text-sm pr-1">كلمة المرور</span>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-orange-400" size={20} />
              <input
                type="password"
                className="w-full border border-orange-200 rounded-xl pl-4 pr-10 py-2 bg-orange-50 focus:border-orange-400 transition text-slate-700 font-bold outline-none shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </label>

          {/* نوع الحساب */}
          <div>
            <label className="text-slate-700 font-bold pr-1 mb-1 block">نوع الحساب</label>
            <select
              className="border border-orange-200 rounded-xl px-3 py-2 w-full mt-1 bg-orange-50 focus:border-orange-400 text-slate-700 font-bold outline-none shadow-sm transition"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="student">طالب</option>
              <option value="teacher">معلم</option>
            </select>
          </div>

          {error && <div className="text-red-600 text-center font-bold text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition shadow text-lg mt-1"
          >
            {loading ? "جاري التسجيل..." : "تسجيل"}
          </button>
        </form>

        <div className="flex flex-col items-center gap-2 mt-4">
          <Link to="/login" className="text-orange-600 hover:underline font-bold text-sm">
            لديك حساب؟ <span className="underline">دخول</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
