import { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Mail, Lock, LogIn } from "lucide-react";
import BackButton from "../../components/ui/BackButton";

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
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (!profile) {
                // أنشئ صف جديد في جدول profiles
                const { error: insertError } = await supabase.from("profiles").insert([
                    {
                        user_id: user.id,
                        full_name: user.user_metadata?.full_name || "بدون اسم",
                        role: user.user_metadata?.role || "student",
                        avatar_url: null,
                        specialization: null,
                        birth_date: null,
                    },
                ]);
                if (insertError) {
                    setError("تم تسجيل الدخول لكن حدث خطأ في مزامنة الملف الشخصي.");
                    setLoading(false);
                    return;
                }
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow flex flex-col gap-4">
                <BackButton />
                <h2 className="text-2xl font-bold text-orange-500 mb-3 flex items-center gap-2">
                    <LogIn size={26} /> تسجيل الدخول
                </h2>
                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
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
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "جاري الدخول..." : "دخول"}
                    </Button>
                    <Link to="/register" className="text-orange-500 text-center hover:underline">
                        إنشاء حساب جديد
                    </Link>
                </form>
            </div>
        </div>
    );
}
