import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const TeacherDashboardDataContext = createContext();

export function TeacherDashboardDataProvider({ userId, children }) {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        courses: [],
        sectionsMap: {},
        quizzesMap: {},
        ratingsMap: {},
    });

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchAll = async () => {
            setLoading(true);

            // 1. جلب الدورات
            const { data: courses } = await supabase
                .from("courses")
                .select("*, course_ratings(*), course_enrollments(*)")
                .eq("teacher_id", userId);

            const courseIds = courses.map((c) => c.id);

            // 2. جلب الأقسام
            const { data: sections } = await supabase
                .from("sections")
                .select("*")
                .in("course_id", courseIds);

            const sectionsMap = {};
            for (let course of courseIds) {
                sectionsMap[course] = sections.filter((s) => s.course_id === course);
            }

            // 3. جلب الاختبارات
            const sectionIds = sections.map((s) => s.id);
            const { data: quizzes } = await supabase
                .from("quizzes")
                .select("*")
                .in("section_id", sectionIds);

            const quizzesMap = {};
            for (let sid of sectionIds) {
                quizzesMap[sid] = quizzes.filter((q) => q.section_id === sid);
            }

            // 4. التقييمات
            const ratingsMap = {};
            for (let course of courses) {
                const rts = course.course_ratings || [];
                const count = rts.length;
                const avg = count
                    ? (rts.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)
                    : "—";
                ratingsMap[course.id] = { avg, count };
            }

            // تخزين البيانات
            setDashboardData({
                courses,
                sectionsMap,
                quizzesMap,
                ratingsMap,
            });

            setLoading(false);
        };

        fetchAll();
    }, [userId]);

    return (
        <TeacherDashboardDataContext.Provider value={{ ...dashboardData, loading }}>
            {children}
        </TeacherDashboardDataContext.Provider>
    );
}

export function useTeacherDashboardData() {
    return useContext(TeacherDashboardDataContext);
}
