import { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "../services/supabaseClient";
import { toast } from "sonner";

// 1. إنشاء السياق
const CoursesDataContext = createContext();

// 2. المزود الرئيسي
export function CoursesDataProvider({ children }) {
    // الأقسام لكل كورس: { [courseId]: [sections] }
    const [sectionsMap, setSectionsMap] = useState({});
    // الاختبارات لكل قسم: { [sectionId]: [quizzes] }
    const [quizzesMap, setQuizzesMap] = useState({});
    // محتوى الدروس لكل قسم: { [sectionId]: [contents] }
    const [contentsMap, setContentsMap] = useState({});
    // الطلاب المسجلين لكل كورس: { [courseId]: [{enrollment, profile}] }
    const [enrolledMap, setEnrolledMap] = useState({});
    // التعليقات لكل كورس: { [courseId]: [comments] }
    const [commentsMap, setCommentsMap] = useState({});
    // تقييمات الدورات: { [courseId]: { avg, count, myRating } }
    const [ratingsMap, setRatingsMap] = useState({});
    // حالات التحميل
    const [loading, setLoading] = useState(false);

    // ----------- الأقسام (Sections) -------------
    const fetchSections = useCallback(async (courseId) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("sections")
            .select("*")
            .eq("course_id", courseId)
            .order("id", { ascending: true });

        setLoading(false);
        if (error) {
            toast.error("تعذر جلب الأقسام!");
            setSectionsMap((prev) => ({ ...prev, [courseId]: [] }));
            return [];
        }
        setSectionsMap((prev) => ({ ...prev, [courseId]: data || [] }));
        return data || [];
    }, []);

    const addSection = async (courseId, title) => {
        setLoading(true);
        const { error } = await supabase
            .from("sections")
            .insert([{ course_id: courseId, title }]);
        setLoading(false);
        if (!error) {
            await fetchSections(courseId);
            return true;
        }
        return false;
    };

    const updateSection = async (sectionId, courseId, title) => {
        setLoading(true);
        const { error } = await supabase
            .from("sections")
            .update({ title })
            .eq("id", sectionId);
        setLoading(false);
        if (!error) {
            await fetchSections(courseId);
            return true;
        }
        return false;
    };

    const deleteSection = async (sectionId, courseId) => {
        setLoading(true);
        const { error } = await supabase
            .from("sections")
            .delete()
            .eq("id", sectionId);
        setLoading(false);
        if (!error) {
            await fetchSections(courseId);
            return true;
        }
        return false;
    };

    // ----------- الاختبارات (Quizzes) -------------
    const fetchQuizzes = useCallback(async (sectionId) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("quizzes")
            .select("*")
            .eq("section_id", sectionId)
            .order("id", { ascending: true });

        setLoading(false);
        if (error) {
            toast.error("تعذر جلب الاختبارات!");
            setQuizzesMap((prev) => ({ ...prev, [sectionId]: [] }));
            return [];
        }
        setQuizzesMap((prev) => ({ ...prev, [sectionId]: data || [] }));
        return data || [];
    }, []);

    const addQuiz = async (sectionId, title) => {
        setLoading(true);
        const { error } = await supabase
            .from("quizzes")
            .insert([{ section_id: sectionId, title }]);
        setLoading(false);
        if (!error) {
            await fetchQuizzes(sectionId);
            return true;
        }
        return false;
    };

    const updateQuiz = async (quizId, sectionId, title) => {
        setLoading(true);
        const { error } = await supabase
            .from("quizzes")
            .update({ title })
            .eq("id", quizId);
        setLoading(false);
        if (!error) {
            await fetchQuizzes(sectionId);
            return true;
        }
        return false;
    };

    const deleteQuiz = async (quizId, sectionId) => {
        setLoading(true);
        const { error } = await supabase
            .from("quizzes")
            .delete()
            .eq("id", quizId);
        setLoading(false);
        if (!error) {
            await fetchQuizzes(sectionId);
            return true;
        }
        return false;
    };

    // ----------- محتوى الدروس (Contents) -------------
    const fetchContents = useCallback(async (sectionId) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("contents")
            .select("*")
            .eq("section_id", sectionId)
            .order("id", { ascending: true });

        setLoading(false);
        if (error) {
            toast.error("تعذر جلب محتوى الدروس!");
            setContentsMap((prev) => ({ ...prev, [sectionId]: [] }));
            return [];
        }
        setContentsMap((prev) => ({ ...prev, [sectionId]: data || [] }));
        return data || [];
    }, []);

    const addContent = async (sectionId, title, body, files = []) => {
        setLoading(true);
        const { error } = await supabase
            .from("contents")
            .insert([{ section_id: sectionId, title, body, files }]);
        setLoading(false);
        if (!error) {
            await fetchContents(sectionId);
            return true;
        }
        return false;
    };

    const updateContent = async (contentId, sectionId, title, body, files = []) => {
        setLoading(true);
        const { error } = await supabase
            .from("contents")
            .update({ title, body, files })
            .eq("id", contentId);
        setLoading(false);
        if (!error) {
            await fetchContents(sectionId);
            return true;
        }
        return false;
    };

    const deleteContent = async (contentId, sectionId) => {
        setLoading(true);
        const { error } = await supabase
            .from("contents")
            .delete()
            .eq("id", contentId);
        setLoading(false);
        if (!error) {
            await fetchContents(sectionId);
            return true;
        }
        return false;
    };

    // ----------- الطلاب المسجلون (Enrolled Students) -------------
    const fetchEnrolledStudents = useCallback(async (courseId) => {
        setLoading(true);
        const { data: enrollments, error } = await supabase
            .from("course_enrollments")
            .select("*")
            .eq("course_id", courseId);

        if (error) {
            toast.error("تعذر تحميل الطلاب!");
            setEnrolledMap((prev) => ({ ...prev, [courseId]: [] }));
            setLoading(false);
            return [];
        }
        let studentsWithProfile = [];
        if (enrollments && enrollments.length > 0) {
            const userIds = enrollments.map(e => e.user_id);
            const { data: profiles } = await supabase
                .from("profiles")
                .select("user_id, full_name, avatar_url")
                .in("user_id", userIds);

            const profilesMap = {};
            (profiles || []).forEach(p => profilesMap[p.user_id] = p);

            studentsWithProfile = enrollments.map(enr => ({
                ...enr,
                profile: profilesMap[enr.user_id] || {},
            }));
        }
        setEnrolledMap((prev) => ({ ...prev, [courseId]: studentsWithProfile }));
        setLoading(false);
        return studentsWithProfile;
    }, []);

    const updateEnrollmentCompletion = async (enrollmentId, courseId, is_completed) => {
        setLoading(true);
        const { error } = await supabase
            .from("course_enrollments")
            .update({ is_completed })
            .eq("id", enrollmentId);
        setLoading(false);
        if (!error) {
            await fetchEnrolledStudents(courseId);
            return true;
        }
        return false;
    };

    // ----------- التعليقات (Course Comments) -------------
    const fetchComments = useCallback(async (courseId) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("course_comments")
            .select("*, profiles:user_id(full_name, avatar_url)")
            .eq("course_id", courseId)
            .order("created_at", { ascending: false });
        setLoading(false);
        if (error) {
            toast.error("تعذر تحميل التعليقات!");
            setCommentsMap((prev) => ({ ...prev, [courseId]: [] }));
            return [];
        }
        setCommentsMap((prev) => ({ ...prev, [courseId]: data || [] }));
        return data || [];
    }, []);

    const addComment = async ({ courseId, userId, comment, parentId }) => {
        setLoading(true);
        const { error } = await supabase.from("course_comments").insert([
            {
                course_id: courseId,
                user_id: userId,
                comment,
                parent_id: parentId || null,
            }
        ]);
        setLoading(false);
        if (!error) {
            await fetchComments(courseId);
            return true;
        }
        toast.error("تعذر إضافة التعليق!");
        return false;
    };

    const editComment = async ({ commentId, newComment }) => {
        setLoading(true);
        // البحث عن الكورس الحالي لكي نعيد تحميل التعليقات بعد التعديل
        const { data: commentRow } = await supabase
            .from("course_comments")
            .select("course_id")
            .eq("id", commentId)
            .single();

        const { error } = await supabase
            .from("course_comments")
            .update({ comment: newComment })
            .eq("id", commentId);

        setLoading(false);
        if (!error && commentRow?.course_id) {
            await fetchComments(commentRow.course_id);
            return true;
        }
        toast.error("تعذر تعديل التعليق!");
        return false;
    };

    const deleteComment = async (commentId) => {
        setLoading(true);
        // احضر الكورس أولا لإعادة تحميله بعد الحذف
        const { data: commentRow } = await supabase
            .from("course_comments")
            .select("course_id")
            .eq("id", commentId)
            .single();

        const { error } = await supabase
            .from("course_comments")
            .delete()
            .eq("id", commentId);

        setLoading(false);
        if (!error && commentRow?.course_id) {
            await fetchComments(commentRow.course_id);
            return true;
        }
        toast.error("تعذر حذف التعليق!");
        return false;
    };

    // ----------- تقييمات الكورسات (Course Ratings) -------------
    const fetchCourseRating = useCallback(async (courseId, userId) => {
        // احسب المتوسط وعدد المقيمين وتقييم المستخدم الحالي
        const { data, error } = await supabase
            .from('course_ratings')
            .select('rating, user_id')
            .eq('course_id', courseId);

        if (error) {
            toast.error("تعذر تحميل التقييمات!");
            setRatingsMap(prev => ({ ...prev, [courseId]: { avg: 0, count: 0, myRating: 0 } }));
            return;
        }

        const ratings = data || [];
        const count = ratings.length;
        const avg = count ? (ratings.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : 0;
        const myRating = ratings.find(r => r.user_id === userId)?.rating || 0;

        setRatingsMap(prev => ({
            ...prev,
            [courseId]: { avg, count, myRating }
        }));
    }, []);

    const setCourseRating = async (courseId, userId, rating) => {
        const { error } = await supabase
            .from('course_ratings')
            .upsert([{ course_id: courseId, user_id: userId, rating }], { onConflict: ['course_id', 'user_id'] });

        if (!error) {
            await fetchCourseRating(courseId, userId);
            toast.success("تم حفظ تقييمك");
            return true;
        }
        toast.error("تعذر حفظ التقييم");
        return false;
    };

    // 3. قيمة السياق (value)
    const contextValue = {
        // أقسام
        sectionsMap, fetchSections, addSection, updateSection, deleteSection,
        // اختبارات
        quizzesMap, fetchQuizzes, addQuiz, updateQuiz, deleteQuiz,
        // محتوى
        contentsMap, fetchContents, addContent, updateContent, deleteContent,
        // طلاب
        enrolledMap, fetchEnrolledStudents, updateEnrollmentCompletion,
        // تعليقات
        commentsMap, fetchComments, addComment, editComment, deleteComment,
        // تقييمات
        ratingsMap, fetchCourseRating, setCourseRating,
        // حالة عامة
        loading,
    };

    return (
        <CoursesDataContext.Provider value={contextValue}>
            {children}
        </CoursesDataContext.Provider>
    );
}

// 4. هوك جاهز للاستدعاء في أي مكون
export function useCoursesData() {
    return useContext(CoursesDataContext);
}
