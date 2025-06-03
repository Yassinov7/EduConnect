import "keen-slider/keen-slider.min.css";
import { useState } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { useGlobalData } from "../contexts/GlobalDataProvider";
import { useKeenSlider } from "keen-slider/react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare, Bell, BarChart, Star, UserPlus, LogIn,
  Users, LayoutDashboard, CheckCircle2, ArrowLeft, ArrowRight, Info
} from "lucide-react";

// مكون بطاقة ميزة المنصة
function FeatureCard({ icon, title, children }) {
  return (
    <div className="flex flex-col gap-2 bg-white shadow-sm rounded-2xl p-5 items-center border-t-4 border-orange-200 min-h-[180px]">
      <div>{icon}</div>
      <div className="text-lg font-bold text-orange-700">{title}</div>
      <div className="text-gray-700 text-center text-sm">{children}</div>
    </div>
  );
}

export default function PlatformShowcasePage() {
  const { user } = useAuth();
  const { categories, categoriesLoading, courses, coursesLoading } = useGlobalData();

  const [selectedCategory, setSelectedCategory] = useState(null);

  // كاروسيل التصنيفات
  const [catRef, catSlider] = useKeenSlider({
    slides: { perView: 3.2, spacing: 16 },
    rtl: true,
    breakpoints: {
      "(max-width: 640px)": { slides: { perView: 1.5, spacing: 10 } }
    }
  });

  // كاروسيل الدورات
  const [courseRef, courseSlider] = useKeenSlider({
    slides: { perView: 2.1, spacing: 14 },
    rtl: true,
    breakpoints: {
      "(max-width: 640px)": { slides: { perView: 1.1, spacing: 10 } }
    }
  });

  // دورات التصنيف المحدد
  const filteredCourses = selectedCategory
    ? courses.filter(c => c.category_id === selectedCategory.id)
    : [];

  // ألوان خلفيات للأقسام
  const sectionBg = [
    "bg-white",
    "bg-gradient-to-b from-orange-50 via-white to-orange-50",
    "bg-gradient-to-b from-orange-100 via-orange-50 to-white"
  ];

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col gap-0" dir="rtl">
      {/* دعوة في الأعلى */}
      <section className="w-full px-2 py-8 md:py-12 flex flex-col items-center bg-gradient-to-b from-orange-50 via-white to-white relative">
        <img src="/favicon.png" alt="شعار EduConnect" className="w-25 h-25 rounded-xl shadow mb-3" />
        <h1 className="text-2xl md:text-4xl font-extrabold text-orange-600 mb-2 tracking-tight text-center">انضم لأفضل تجربة تعليمية!</h1>
        <p className="text-slate-700 max-w-2xl text-center text-lg mb-5">
          سجّل الآن وتعرّف على منصة EduConnect: الدورات، المحادثة، التقييمات، والاختبارات كلها بين يديك مجانًا.
        </p>
        <div className="flex gap-4 mb-3 flex-wrap justify-center">
          <Link to="/register" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-lg shadow transition">
            <UserPlus size={22} />
            إنشاء حساب جديد
          </Link>
          <Link to="/login" className="flex items-center gap-2 bg-white hover:bg-orange-100 text-orange-600 font-bold px-6 py-3 rounded-xl text-lg shadow border transition">
            <LogIn size={22} />
            تسجيل دخول
          </Link>
        </div>
        <Link
          to="/about"
          className="flex items-center gap-2 text-blue-900 hover:text-blue-700 font-bold text-sm underline mt-2"
        >
          <Info size={20} /> حول المنصة
        </Link>
      </section>

      {/* مميزات المنصة */}
      <section className={`${sectionBg[1]} w-full py-10`}>
        <div className="max-w-6xl mx-auto px-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<MessageSquare size={32} className="text-blue-600" />} title="محادثة مباشرة مع المعلم">
              تواصل سريع وفعال مع المعلمين والطلاب عبر دردشة آمنة ومرنة.
            </FeatureCard>
            <FeatureCard icon={<Star size={32} className="text-yellow-400" />} title="تقييمات ومراجعات">
              آراء الطلاب في كل دورة لزيادة الشفافية والجودة.
            </FeatureCard>
            <FeatureCard icon={<LayoutDashboard size={32} className="text-orange-600" />} title="لوحة تحكم متطورة">
              إدارة سهلة وحديثة لكل دروسك واختباراتك، من مكان واحد.
            </FeatureCard>
            <FeatureCard icon={<Bell size={32} className="text-rose-500" />} title="إشعارات فورية">
              كل جديد يصلك فورًا: مهام، رسائل، اختبارات وتنبيهات التقدّم.
            </FeatureCard>
            <FeatureCard icon={<BarChart size={32} className="text-sky-600" />} title="مراقبة التقدم">
              رسوم بيانية وتقدم تفاعلي خطوة بخطوة لكل إنجازاتك.
            </FeatureCard>
            <FeatureCard icon={<CheckCircle2 size={32} className="text-green-500" />} title="اختبارات إلكترونية">
              اختبر نفسك وتعلم بذكاء مع أسئلة فورية وتغذية راجعة ذكية.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* التصنيفات كاروسيل */}
      <section className={`${sectionBg[2]} w-full py-10`}>
        <div className="max-w-5xl mx-auto px-2">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-orange-500 pr-2">التصنيفات</h2>
            {selectedCategory &&
              <button onClick={() => setSelectedCategory(null)} className="text-xs text-gray-600 underline">
                عرض كل التصنيفات
              </button>
            }
          </div>
          {categoriesLoading ? (
            <div className="text-center text-gray-400 py-8">جاري تحميل التصنيفات...</div>
          ) : (
            <div className="relative">
              <div ref={catRef} className="keen-slider">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`keen-slider__slide flex flex-col items-center gap-2 bg-white border-2 transition shadow rounded-2xl px-6 py-4 min-w-[220px] cursor-pointer
                      ${selectedCategory && selectedCategory.id === cat.id ? "border-orange-500" : "border-orange-200 hover:border-orange-400"}
                    `}
                  >
                    <span className="text-orange-600 font-bold text-lg">{cat.name}</span>
                    <span className="text-gray-500 text-sm text-center">{cat.description || "بدون وصف"}</span>
                    <span className="bg-orange-50 mt-1 text-orange-700 text-xs font-bold px-3 py-1 rounded-xl">{cat.courses_count} دورة</span>
                  </button>
                ))}
              </div>
              {/* أزرار تحكم كاروسيل التصنيفات - اتجاه عربي (يمين للسابق، يسار للتالي) */}
              <button
                onClick={() => catSlider.current?.next()}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border rounded-full shadow p-1 z-10"
              >
                <ArrowLeft className="text-orange-500" />
              </button>
              <button
                onClick={() => catSlider.current?.prev()}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border rounded-full shadow p-1 z-10"
              >
                <ArrowRight className="text-orange-500" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* دورات التصنيف المحدد */}
      {selectedCategory && (
        <section className="w-full py-10 bg-white">
          <div className="max-w-6xl mx-auto px-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-orange-500 pr-2">
                دورات {selectedCategory.name}
              </h3>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-gray-500 underline"
              >
                عودة لكل التصنيفات
              </button>
            </div>
            {coursesLoading ? (
              <div className="text-center py-8 text-gray-400">جاري تحميل الدورات...</div>
            ) : (
              <>
                {filteredCourses.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 font-bold">لا توجد دورات في هذا التصنيف.</div>
                ) : (
                  <div ref={courseRef} className="keen-slider">
                    {filteredCourses.map(course => (
                      <div key={course.id} className="keen-slider__slide bg-orange-50 shadow rounded-2xl p-4 flex flex-col items-start min-w-[270px] max-w-xs mx-auto h-[530px] relative overflow-hidden">
                        <img
                          src={course.cover_url || "https://placehold.co/400x220/orange/white?text=بدون+غلاف"}
                          alt="غلاف الدورة"
                          className="w-full h-80 object-cover rounded-xl shadow mb-2"
                          loading="lazy"
                        />
                        <div className="font-extrabold text-lg text-orange-700 mb-1">{course.title}</div>
                        <div className="text-gray-700 text-sm line-clamp-3">{course.description || "لا يوجد وصف للدورة."}</div>
                        <div className="text-xs text-slate-500 mt-1">الطلاب: <b>{course.students_count || 0}</b></div>
                        {/* زر تفاصيل الدورة ثابت بالأسفل */}
                        <div className="absolute left-0 bottom-0 w-full px-4 pb-4 flex justify-center">
                          <Link
                            to={`/courses/${course.id}`}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl shadow text-sm w-full transition text-center"
                          >عرض تفاصيل الدورة</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* تحكم كاروسيل الدورات */}
                {filteredCourses.length > 2 && (
                  <div className="flex justify-center gap-3 mt-2">
                    <button
                      onClick={() => courseSlider.current?.next()}
                      className="bg-white border rounded-full shadow p-1"
                    ><ArrowLeft className="text-orange-500" /></button>
                    <button
                      onClick={() => courseSlider.current?.prev()}
                      className="bg-white border rounded-full shadow p-1"
                    ><ArrowRight className="text-orange-500" /></button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

      )}
      <section className="w-full px-2 py-8 md:py-12 flex flex-col items-center bg-gradient-to-b from-orange-50 via-white to-white relative">
        <img src="/favicon.png" alt="شعار EduConnect" className="w-20 h-20 rounded-xl shadow mb-3" />
        <h1 className="text-2xl md:text-4xl font-extrabold text-orange-600 mb-2 tracking-tight text-center">انضم لأفضل تجربة تعليمية!</h1>
        <p className="text-slate-700 max-w-2xl text-center text-lg mb-5">
          سجّل الآن وتعرّف على منصة EduConnect: الدورات، المحادثة، التقييمات، والاختبارات كلها بين يديك مجانًا.
        </p>
        <div className="flex gap-4 mb-3 flex-wrap justify-center">
          <Link to="/register" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-lg shadow transition">
            <UserPlus size={22} />
            إنشاء حساب جديد
          </Link>
          <Link to="/login" className="flex items-center gap-2 bg-white hover:bg-orange-100 text-orange-600 font-bold px-6 py-3 rounded-xl text-lg shadow border transition">
            <LogIn size={22} />
            تسجيل دخول
          </Link>
        </div>
        <Link
          to="/about"
          className="flex items-center gap-2 text-blue-900 hover:text-blue-700 font-bold text-sm underline mt-2"
        >
          <Info size={20} /> حول المنصة
        </Link>
      </section>
    </div>
  );
}
