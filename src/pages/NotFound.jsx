// src/pages/NotFound.jsx
import { Link } from "react-router-dom";
import { Ghost, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl px-8 py-12 flex flex-col items-center gap-5 max-w-lg w-full animate-fadeIn">
        <Ghost size={72} className="text-orange-400 mb-1" />
        <h1 className="text-5xl font-extrabold text-orange-500 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-blue-950 mb-2">الصفحة غير موجودة</h2>
        <p className="text-slate-600 text-center mb-3">
          عذرًا، الصفحة التي تبحث عنها غير متوفرة.<br />
          قد تكون نقلت أو لم تعد موجودة بعد الآن.
        </p>
        <Link
          to="/"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow transition text-lg mt-2"
        >
          <Home size={22} /> العودة للرئيسية
        </Link>
      </div>
      <div className="mt-12 text-orange-200 text-xs tracking-widest">Extra Learnings &copy; 2025</div>
    </div>
  );
}
