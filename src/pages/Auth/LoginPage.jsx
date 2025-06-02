import { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        // 1. تسجيل الدخول في Supabase Auth
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (loginError) {
            setError("بيانات الدخول غير صحيحة أو لم يتم تفعيل البريد.");
            setLoading(false);
            return;
        }

        const user = data.user;
        if (!user) {
            setError("حدث خطأ غير متوقع. يرجى المحاولة لاحقًا.");
            setLoading(false);
            return;
        }

        // 2. تحقق من وجود ملف profile، وإن لم يوجد أنشئه
        try {
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (!profile) {
                await supabase.from("profiles").insert([
                    {
                        user_id: user.id,
                        full_name: user.user_metadata?.full_name || "بدون اسم",
                        role: user.user_metadata?.role || "student",
                        avatar_url: null,
                        specialization: null,
                        birth_date: null,
                    },
                ]);
            }
        } catch (err) {
            setError("حدث خطأ أثناء مزامنة البيانات. حاول مجددًا.");
            setLoading(false);
            return;
        }

        setLoading(false);
        toast.success("تم تسجيل الدخول بنجاح!");
        navigate("/dashboard");
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-orange-50 via-white to-orange-100">
            {/* كارد الفورم */}
            <div className="w-full max-w-md p-8 sm:p-10 bg-white rounded-3xl shadow-2xl flex flex-col gap-5 border-t-4 border-orange-200 relative">
                {/* زر العودة */}
                <button
                    onClick={() => window.history.back()}
                    className="absolute right-4 top-4 flex items-center gap-1 text-orange-400 hover:text-orange-600 font-bold text-sm"
                >
                    <ArrowRight size={20} /> رجوع
                </button>

                <div className="flex flex-col items-center gap-2 mb-3">
                    <LogIn size={38} className="text-orange-500" />
                    <h2 className="text-2xl font-extrabold text-orange-600 tracking-tight">تسجيل الدخول</h2>
                </div>
                <form className="flex flex-col gap-4 mt-2" onSubmit={handleLogin}>
                    {/* البريد */}
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

                    {error && <div className="text-red-600 text-center font-bold text-sm">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition shadow text-lg mt-1"
                    >
                        {loading ? "جاري الدخول..." : "دخول"}
                    </button>
                </form>

                <div className="flex flex-col items-center gap-2 mt-4">
                    <Link to="/register" className="text-orange-600 hover:underline font-bold text-sm">
                        ليس لديك حساب؟ <span className="underline">إنشاء حساب جديد</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
