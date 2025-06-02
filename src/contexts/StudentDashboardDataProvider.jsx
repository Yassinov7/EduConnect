import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const StudentDashboardContext = createContext();

export function StudentDashboardDataProvider({ userId, children }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    myCourses: [],
    completedCourses: [],
    quizStats: {
      totalAnswers: 0,
      correctAnswers: 0,
      percent: 0,
      byQuiz: [],
    },
  });

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    async function fetchData() {
      setLoading(true);

      // 1. الدورات المسجل فيها الطالب
      const { data: enrollments = [] } = await supabase
        .from("course_enrollments")
        .select("*, course:courses(*)")
        .eq("user_id", userId);

      const myCourses = enrollments.map(e => e.course);
      const completedCourses = enrollments.filter(e => e.is_completed).map(e => e.course);

      // 2. جلب كل إجابات الطالب في الاختبارات
      const { data: quizAnswers = [] } = await supabase
        .from("quiz_answers")
        .select("quiz_id, is_correct")
        .eq("user_id", userId);

      // تجميع معرفات الكويز
      const quizIds = [...new Set(quizAnswers.map(a => a.quiz_id))];

      //جلب عناوين الاختبارات 
      let quizzesTitlesMap = {};
      if (quizIds.length) {
        const { data: quizzes = [] } = await supabase
          .from("quizzes")
          .select("id, title")
          .in("id", quizIds);
        // أنشئ map سريع: {quiz_id: title}
        quizzesTitlesMap = quizzes.reduce((acc, curr) => {
          acc[curr.id] = curr.title;
          return acc;
        }, {});
      }
      // 3. إحصائيات عامة
      const totalAnswers = quizAnswers.length;
      const correctAnswers = quizAnswers.filter(a => a.is_correct).length;
      const percent = totalAnswers ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

      // 4. إحصائيات لكل اختبار (Quiz)
      const quizMap = {}; // {quiz_id: { total, correct } }
      quizAnswers.forEach(({ quiz_id, is_correct }) => {
        if (!quizMap[quiz_id]) quizMap[quiz_id] = { total: 0, correct: 0 };
        quizMap[quiz_id].total += 1;
        if (is_correct) quizMap[quiz_id].correct += 1;
      });
      // تحويلها لمصفوفة
      const byQuiz = Object.entries(quizMap).map(([quiz_id, stats]) => ({
        quiz_id,
        quiz_title:quizzesTitlesMap[quiz_id] || `$(quiz_id)`,
        total: stats.total,
        correct: stats.correct,
        percent: stats.total ? Math.round((stats.correct / stats.total) * 100) : 0,
      }));

      setData({
        myCourses,
        completedCourses,
        quizStats: {
          totalAnswers,
          correctAnswers,
          percent,
          byQuiz,
        },
      });
      setLoading(false);
    }
    fetchData();
  }, [userId]);

  return (
    <StudentDashboardContext.Provider value={{ ...data, loading }}>
      {children}
    </StudentDashboardContext.Provider>
  );
}

export function useStudentDashboardData() {
  return useContext(StudentDashboardContext);
}
