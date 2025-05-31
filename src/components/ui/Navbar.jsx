// src/components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider"; // المسار الجديد للسياق
import { UserCircle } from "lucide-react";


export default function Navbar() {
  const { profile, loading } = useAuth();
  const location = useLocation();

  const links = [
    { to: "/dashboard", label: "الرئيسية" },
    { to: "/courses", label: "الدورات" },
    { to: "/chat", label: "المحادثات" },
    // فقط للطالب
    ...(profile?.role === "student"
      ? [{ to: "/my-results", label: "نتائجي" }]
      : []),
    { to: "/profile", label: "الملف الشخصي" },
  ];

  return (
    <nav className="fixed top-0 right-0 left-0 z-20 bg-white shadow flex items-center justify-between h-20 px-6 border-b gap-4">
      {/* شعار واسم المنصة */}
      <div className="flex items-center gap-3">
        <span className="font-extrabold text-3xl text-orange-500 hover:text-orange-600 hover:scale-103 transition tracking-wide">
          EduConnect
        </span>
      </div>
      {/* روابط التنقل */}
      <div className="flex items-center gap-7 hidden md:flex">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`font-semibold hover:text-orange-500 transition ${location.pathname.startsWith(link.to) ? "text-orange-500" : "text-slate-700"
              }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      {/* صورة المستخدم */}
      <Link to="/profile" className="flex items-center gap-2">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border border-orange-200 shadow"
          />
        ) : (
          <UserCircle size={40} className="text-orange-700" />
        )}
        <span className="font-bold text-orange-600 hidden sm:block">
          {profile?.full_name || ""}
        </span>
      </Link>
    </nav>
  );
}

