import { GraduationCap, MessageSquare, Users, LayoutDashboard, Star, CheckCircle2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pt-0 pb-16" dir="rtl">
            {/* Hero/About Header */}
            <section className="flex flex-col items-center justify-center py-12 gap-3 bg-white shadow-sm rounded-b-3xl">
                <img src="/favicon.png" alt="شعار EduConnect" className="w-16 h-16 rounded-xl shadow mb-3" />
                <h1 className="text-3xl md:text-4xl font-extrabold text-orange-600 mb-2">حول منصة EduConnect</h1>
                <p className="text-slate-700 max-w-2xl text-center text-lg mb-2">
                    EduConnect هي منصتك الموثوقة للتعلم والتواصل بين الطلاب والمعلمين، حيث نجمع بين التقنية، الجودة، وسهولة الاستخدام في تجربة تعليمية لا مثيل لها.
                </p>
                <Link to="/" className="text-sm text-orange-500 hover:underline mt-2">العودة للصفحة الرئيسية</Link>
            </section>

            {/* عن المنصة */}
            <section className="max-w-3xl mx-auto mt-8 mb-14 px-3 py-8 bg-orange-50 rounded-2xl shadow flex flex-col items-center">
                <h2 className="text-xl font-bold text-orange-500 mb-4 flex items-center gap-2">
                    <GraduationCap size={24} /> رسالتنا
                </h2>
                <p className="text-gray-700 text-base text-center leading-relaxed">
                    نؤمن بأن التعليم يجب أن يكون متاحًا وسهل الوصول للجميع. نعمل على توفير بيئة تعليمية متكاملة تضم أحدث الدورات، نظام تواصل مباشر مع المعلمين، اختبارات إلكترونية، إشعارات ذكية، ولوحة تحكم سهلة الاستخدام.
                </p>
            </section>

            {/* قيم المنصة والمزايا */}
            <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 px-3 mt-6 mb-12">
                <AboutCard icon={<Users size={32} className="text-blue-700" />} title="مجتمع تعليمي نشِط">
                    تفاعل مع آلاف الطلاب والمعلمين وشارك خبراتك وتعلم من الآخرين.
                </AboutCard>
                <AboutCard icon={<LayoutDashboard size={32} className="text-orange-500" />} title="لوحة تحكم عصرية">
                    كل شيء تحت سيطرتك: إدارة الدورات، متابعة التقدم، ونتائجك الأكاديمية.
                </AboutCard>
                <AboutCard icon={<MessageSquare size={32} className="text-sky-500" />} title="محادثة ودعم فوري">
                    تواصل بسهولة مع فريق الدعم أو المعلمين لأي استفسار أو سؤال.
                </AboutCard>
                <AboutCard icon={<Star size={32} className="text-yellow-400" />} title="تقييمات حقيقية">
                    راجع تقييمات الطلاب على الدورات، واختر الأنسب لك بكل ثقة.
                </AboutCard>
                <AboutCard icon={<CheckCircle2 size={32} className="text-green-500" />} title="اختبارات وتقدم">
                    اختبر معلوماتك بشكل تفاعلي وتابع تطورك بدقة لحظة بلحظة.
                </AboutCard>
                <AboutCard icon={<ShieldCheck size={32} className="text-orange-700" />} title="أمان وخصوصية">
                    بياناتك في أمان تام مع أحدث تقنيات الحماية وخصوصية عالية.
                </AboutCard>
            </section>

            {/* رؤية مستقبلية */}
            <section className="max-w-4xl mx-auto my-10 px-3 py-8 bg-white rounded-2xl shadow flex flex-col items-center">
                <h2 className="text-xl font-bold text-orange-500 mb-2">رؤيتنا للمستقبل</h2>
                <p className="text-gray-700 text-base text-center leading-relaxed">
                    نسعى لنكون الخيار الأول لكل متعلم ومعلم عربي، مع التوسع المستمر في تقديم محتوى متجدد، تقنيات تفاعلية، ودعم تعليمي فريد.
                </p>
            </section>

            {/* دعوة أخيرة للتجربة */}
            <section className="flex flex-col items-center justify-center mt-12 gap-5">
                <h3 className="text-2xl font-extrabold text-orange-600">انضم إلينا وابدأ رحلتك التعليمية الآن!</h3>
                <div className="flex gap-4 mb-4">
                    <Link to="/register" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-lg shadow transition">
                        إنشاء حساب جديد
                    </Link>
                    <Link to="/login" className="flex items-center gap-2 bg-white hover:bg-orange-100 text-orange-600 font-bold px-6 py-3 rounded-xl text-lg shadow border transition">
                        تسجيل دخول
                    </Link>
                </div>
            </section>
        </div>
    );
}

// بطاقة مميزة للعنصر
function AboutCard({ icon, title, children }) {
    return (
        <div className="flex flex-col gap-2 bg-white shadow rounded-2xl p-5 items-center border-t-4 border-orange-100 min-h-[170px]">
            <div>{icon}</div>
            <div className="text-lg font-bold text-orange-600">{title}</div>
            <div className="text-gray-700 text-center text-sm">{children}</div>
        </div>
    );
}
