// src/contexts/AuthProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // بيانات المستخدم (من Supabase)
  const [profile, setProfile] = useState(null); // بيانات الملف الشخصي (جدول profiles)
  const [loading, setLoading] = useState(true);

  // دالة لجلب ملف المستخدم من profiles
  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data || null);
  };

  // عند بداية التطبيق أو تغير الـauth
  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
      if (data?.session?.user?.id) fetchProfile(data.session.user.id);
      setLoading(false);
    });

    // مراقبة تسجيل الدخول والخروج
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user?.id) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  // دوال auth جاهزة للاستخدام
  const signIn = async ({ email, password }) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data?.user?.id) {
      await fetchProfile(data.user.id);
    }
    setLoading(false);
    return { data, error };
  };

  const signUp = async ({ email, password, full_name, role }) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, role } },
    });
    if (!error && data?.user?.id) {
      await fetchProfile(data.user.id);
    }
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile: () => user?.id && fetchProfile(user.id),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
