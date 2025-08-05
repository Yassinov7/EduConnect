import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { Home, Book, MessageCircle, UserCircle, CheckSquareIcon } from "lucide-react";

export default function BottomNav() {
  const location = useLocation();
  const { profile } = useAuth();

  // بناؤها حسب الدور
  const navItems = [
    { to: "/dashboard", label: "الرئيسية", icon: Home },
    { to: "/courses", label: "الدورات", icon: Book },
    { to: "/chat", label: "المحادثات", icon: MessageCircle },
    // فقط للطالب
    ...(profile?.role === "student"
      ? [{ to: "/my-results", label: "نتائجي", icon: CheckSquareIcon }]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white shadow-md border-t flex items-center justify-around h-16 md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = location.pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-1 font-medium text-xs transition ${active ? "text-orange-500" : "text-slate-600"
              }`}
          >
            <Icon size={24} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
