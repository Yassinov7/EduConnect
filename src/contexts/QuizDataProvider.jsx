// src/contexts/QuizDataContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "../services/supabaseClient";
import { toast } from "sonner";

// 1. إنشاء السياق
const QuizDataContext = createContext();

export function QuizDataProvider({ children }) {
    const [loading, setLoading] = useState(false);
    const [questionsMap, setQuestionsMap] = useState({}); // { [quizId]: [questions] }
    const [answersMap, setAnswersMap] = useState({}); // { [`${quizId}_${userId}`]: [answers] }

    // جلب كل أسئلة كويز
    const fetchQuizQuestions = useCallback(async (quizId) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("quiz_questions")
            .select("*")
            .eq("quiz_id", quizId)
            .order("created_at", { ascending: true });

        setLoading(false);
        if (error) {
            toast.error("تعذر جلب أسئلة الاختبار!");
            setQuestionsMap(prev => ({ ...prev, [quizId]: [] }));
            return [];
        }
        setQuestionsMap(prev => ({ ...prev, [quizId]: data || [] }));
        return data || [];
    }, []);

    // إضافة سؤال جديد
    const addQuizQuestion = async (quizId, values) => {
        setLoading(true);
        const { error } = await supabase
            .from("quiz_questions")
            .insert([{ quiz_id: quizId, ...values }]);
        setLoading(false);
        if (!error) {
            await fetchQuizQuestions(quizId);
            toast.success("تمت إضافة السؤال بنجاح");
            return true;
        }
        toast.error("تعذر إضافة السؤال");
        return false;
    };

    // تحديث سؤال
    const updateQuizQuestion = async (questionId, quizId, values) => {
        setLoading(true);
        const { error } = await supabase
            .from("quiz_questions")
            .update({ ...values })
            .eq("id", questionId);
        setLoading(false);
        if (!error) {
            await fetchQuizQuestions(quizId);
            toast.success("تم تحديث السؤال");
            return true;
        }
        toast.error("تعذر تحديث السؤال");
        return false;
    };

    // حذف سؤال
    const deleteQuizQuestion = async (questionId, quizId) => {
        setLoading(true);
        const { error } = await supabase
            .from("quiz_questions")
            .delete()
            .eq("id", questionId);
        setLoading(false);
        if (!error) {
            await fetchQuizQuestions(quizId);
            toast.success("تم حذف السؤال");
            return true;
        }
        toast.error("تعذر حذف السؤال");
        return false;
    };

    // جلب بيانات كويز (العنوان وغيره)
    const fetchQuiz = useCallback(async (quizId) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("quizzes")
            .select("*")
            .eq("id", quizId)
            .single();
        setLoading(false);
        if (error) {
            toast.error("تعذر جلب بيانات الاختبار!");
            return null;
        }
        return data;
    }, []);

    // جلب إجابات طالب على كويز
    const fetchStudentQuizAnswers = useCallback(async (quizId, userId) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("quiz_answers")
            .select("*")
            .eq("quiz_id", quizId)
            .eq("user_id", userId);
        setLoading(false);
        const key = `${quizId}_${userId}`;
        if (error) {
            toast.error("تعذر جلب إجابات الطالب!");
            setAnswersMap(prev => ({ ...prev, [key]: [] }));
            return [];
        }
        setAnswersMap(prev => ({ ...prev, [key]: data || [] }));
        return data || [];
    }, []);

    // جلب جميع نتائج كويز لطالب في كورس
    const fetchStudentCourseQuizResults = useCallback(async (courseId, studentId) => {
        setLoading(true);
        // جلب sections
        const { data: sections } = await supabase
            .from("sections")
            .select("id")
            .eq("course_id", courseId);
        const sectionIds = (sections || []).map(s => s.id);
        // جلب quizzes
        const { data: quizzes } = await supabase
            .from("quizzes")
            .select("id, title")
            .in("section_id", sectionIds);
        const quizIds = (quizzes || []).map(q => q.id);

        // جلب إجابات الطالب لكل الكويزات
        const { data: answers } = await supabase
            .from("quiz_answers")
            .select("quiz_id, is_correct, answered_at")
            .eq("user_id", studentId)
            .in("quiz_id", quizIds);

        // بناء النتائج
        const quizSummary = {};
        (answers || []).forEach(ans => {
            if (!quizSummary[ans.quiz_id]) {
                quizSummary[ans.quiz_id] = {
                    correctCount: 0,
                    totalCount: 0,
                    lastAnsweredAt: ans.answered_at,
                };
            }
            if (ans.is_correct) quizSummary[ans.quiz_id].correctCount += 1;
            quizSummary[ans.quiz_id].totalCount += 1;
            if (ans.answered_at > quizSummary[ans.quiz_id].lastAnsweredAt) {
                quizSummary[ans.quiz_id].lastAnsweredAt = ans.answered_at;
            }
        });

        const quizList = (quizzes || []).map(quiz => ({
            quiz_id: quiz.id,
            quiz_title: quiz.title,
            correctCount: quizSummary[quiz.id]?.correctCount || 0,
            totalCount: quizSummary[quiz.id]?.totalCount || 0,
            lastAnsweredAt: quizSummary[quiz.id]?.lastAnsweredAt || null,
        })).filter(q => q.totalCount > 0);

        setLoading(false);
        return quizList;
    }, []);

    // جلب جميع نتائج الطالب في كل الدورات
    const fetchStudentAllQuizResults = useCallback(async (userId) => {
        setLoading(true);
        // الدورات المسجل بها الطالب
        const { data: enrollments } = await supabase
            .from("course_enrollments")
            .select("course_id, courses(id, title, cover_url, description)")
            .eq("user_id", userId);

        const uniqueCourses = (enrollments || [])
            .map(e => e.courses)
            .filter((c, i, arr) => c && arr.findIndex(x => x.id === c.id) === i);

        // جلب جميع sections و quizzes
        const courseIds = uniqueCourses.map(c => c.id);
        let allQuizzes = [];
        let sections = [];
        if (courseIds.length) {
            const { data: sectionsData } = await supabase
                .from("sections")
                .select("id, course_id")
                .in("course_id", courseIds);

            sections = sectionsData || [];
            const sectionIds = sections.map(s => s.id);
            if (sectionIds.length) {
                const { data: quizzesData } = await supabase
                    .from("quizzes")
                    .select("id, title, section_id")
                    .in("section_id", sectionIds);

                allQuizzes = quizzesData || [];
            }
        }
        // جمع الكويزز حسب الكورس
        const quizzesByCourse = {};
        allQuizzes.forEach(q => {
            const courseId = sections.find(s => s.id === q.section_id)?.course_id;
            if (courseId) {
                if (!quizzesByCourse[courseId]) quizzesByCourse[courseId] = [];
                quizzesByCourse[courseId].push(q);
            }
        });

        // جلب نتائج الطالب في كل اختبار
        let allQuizIds = allQuizzes.map(q => q.id);
        let resultsMap = {};
        if (allQuizIds.length) {
            const { data: quizAnswers } = await supabase
                .from("quiz_answers")
                .select("quiz_id, is_correct")
                .eq("user_id", userId);

            // جمع النتائج: {quiz_id: [answers]}
            const grouped = {};
            (quizAnswers || []).forEach(a => {
                if (!grouped[a.quiz_id]) grouped[a.quiz_id] = [];
                grouped[a.quiz_id].push(a);
            });

            // لكل اختبار: النسبة
            for (const quizId of allQuizIds) {
                const answers = grouped[quizId] || [];
                const total = answers.length;
                const correct = answers.filter(a => a.is_correct).length;
                const score = total > 0 ? Math.round((correct / total) * 100) : null;
                resultsMap[quizId] = { total, correct, score };
            }
        }
        setLoading(false);
        return { courses: uniqueCourses, quizzesByCourse, resultsMap };
    }, []);

    // جلب إجابة سؤال لطالب في كويز
    const fetchStudentQuizAnswerDetail = useCallback(async (quizId, studentId) => {
        setLoading(true);
        // بيانات الطالب
        const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", studentId)
            .single();
        // بيانات الاختبار
        const { data: quizData } = await supabase
            .from("quizzes")
            .select("id, title")
            .eq("id", quizId)
            .single();
        // جلب الأسئلة
        const { data: questionsData } = await supabase
            .from("quiz_questions")
            .select("id, question_text, option_a, option_b, option_c, option_d, correct_option")
            .eq("quiz_id", quizId);
        // جلب إجابات الطالب
        const { data: answersData } = await supabase
            .from("quiz_answers")
            .select("question_id, selected_option, is_correct, answered_at")
            .eq("quiz_id", quizId)
            .eq("user_id", studentId);
        setLoading(false);

        return {
            profile: profileData,
            quiz: quizData,
            questions: questionsData,
            answers: answersData,
        };
    }, []);

    // حل كويز (إدخال إجابات)
    const submitQuizAnswers = useCallback(async (quizId, userId, questions, answers) => {
        setLoading(true);
        // التحقق هل يوجد إجابات سابقة
        const { data: previous } = await supabase
            .from("quiz_answers")
            .select("id")
            .eq("quiz_id", quizId)
            .eq("user_id", userId);
        if (previous && previous.length > 0) {
            setLoading(false);
            return { alreadySolved: true };
        }
        // تجهيز الإجابات للحفظ
        let correctCount = 0;
        const toInsert = questions.map(q => {
            const selected = answers[q.id];
            const is_correct = selected === q.correct_option;
            if (is_correct) correctCount += 1;
            return {
                quiz_id: quizId,
                user_id: userId,
                question_id: q.id,
                selected_option: selected,
                is_correct,
            };
        });

        // حفظ جميع الإجابات دفعة واحدة
        const { error } = await supabase.from("quiz_answers").insert(toInsert);
        setLoading(false);
        if (!error) {
            return {
                correct: correctCount,
                total: questions.length,
                percent: Math.round((correctCount / questions.length) * 100),
                detail: toInsert,
                alreadySolved: false,
            };
        } else {
            toast.error("حدث خطأ أثناء حفظ الإجابات!");
            return { error: true };
        }
    }, []);

    // حذف كويز كامل
    const deleteQuiz = async (quizId) => {
        setLoading(true);
        // حذف الأسئلة أولا ثم الكويز
        await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
        const { error } = await supabase.from("quizzes").delete().eq("id", quizId);
        setLoading(false);
        if (!error) {
            toast.success("تم حذف الاختبار بالكامل");
            return true;
        }
        toast.error("تعذر حذف الاختبار");
        return false;
    };

    // حذف جميع إجابات كويز لطالب (للاختبار أو reset)
    const deleteQuizAnswersForStudent = async (quizId, userId) => {
        setLoading(true);
        await supabase
            .from("quiz_answers")
            .delete()
            .eq("quiz_id", quizId)
            .eq("user_id", userId);
        setLoading(false);
    };

    return (
        <QuizDataContext.Provider value={{
            loading,
            questionsMap,
            answersMap,
            fetchQuizQuestions,
            addQuizQuestion,
            updateQuizQuestion,
            deleteQuizQuestion,
            fetchQuiz,
            fetchStudentQuizAnswers,
            fetchStudentCourseQuizResults,
            fetchStudentAllQuizResults,
            fetchStudentQuizAnswerDetail,
            submitQuizAnswers,
            deleteQuiz,
            deleteQuizAnswersForStudent,
        }}>
            {children}
        </QuizDataContext.Provider>
    );
}

export function useQuizData() {
    return useContext(QuizDataContext);
}
