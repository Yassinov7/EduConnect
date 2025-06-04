import { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "../services/supabaseClient";

const ProgressContext = createContext();

export function ProgressProvider({ children }) {
    const [userProgress, setUserProgress] = useState({}); // { content_123: {...}, quiz_5: {...}, assignment_7: {...}, ... }

    // تحميل التقدم لكل مستخدم ودورة
    const fetchUserProgress = useCallback(async (userId, courseId) => {
        if (!userId || !courseId) return;
        const { data, error } = await supabase
            .from("user_progress")
            .select("*")
            .eq("user_id", userId)
            .eq("course_id", courseId);

        if (!error && data) {
            const progressMap = {};
            data.forEach((row) => {
                if (row.content_id) progressMap[`content_${row.content_id}`] = row;
                if (row.quiz_id) progressMap[`quiz_${row.quiz_id}`] = row;
                if (row.assignment_id) progressMap[`assignment_${row.assignment_id}`] = row;
            });
            setUserProgress(progressMap);
        }
    }, []);

    // إتمام درس
    const markContentCompleted = async (userId, courseId, sectionId, contentId) => {
        const now = new Date().toISOString();
        const { data } = await supabase
            .from("user_progress")
            .select("id")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .eq("section_id", sectionId)
            .eq("content_id", contentId)
            .maybeSingle();

        if (data) {
            await supabase
                .from("user_progress")
                .update({ content_completed: true, completed_at: now })
                .eq("id", data.id);
        } else {
            await supabase
                .from("user_progress")
                .insert({
                    user_id: userId,
                    course_id: courseId,
                    section_id: sectionId,
                    content_id: contentId,
                    content_completed: true,
                    completed_at: now,
                });
        }
        await fetchUserProgress(userId, courseId);
    };

    // إتمام اختبار
    const markQuizCompleted = async (userId, courseId, sectionId, quizId) => {
        const now = new Date().toISOString();
        const { data } = await supabase
            .from("user_progress")
            .select("id")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .eq("section_id", sectionId)
            .eq("quiz_id", quizId)
            .maybeSingle();

        if (data) {
            await supabase
                .from("user_progress")
                .update({ quiz_completed: true, completed_at: now })
                .eq("id", data.id);
        } else {
            await supabase
                .from("user_progress")
                .insert({
                    user_id: userId,
                    course_id: courseId,
                    section_id: sectionId,
                    quiz_id: quizId,
                    quiz_completed: true,
                    completed_at: now,
                });
        }
        await fetchUserProgress(userId, courseId);
    };

    // إتمام تكليف
    const markAssignmentDone = async (userId, courseId, sectionId, assignmentId) => {
        const now = new Date().toISOString();
        const { data } = await supabase
            .from("user_progress")
            .select("id")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .eq("section_id", sectionId)
            .eq("assignment_id", assignmentId)
            .maybeSingle();

        if (data) {
            await supabase
                .from("user_progress")
                .update({ assignment_done: true, completed_at: now })
                .eq("id", data.id);
        } else {
            await supabase
                .from("user_progress")
                .insert({
                    user_id: userId,
                    course_id: courseId,
                    section_id: sectionId,
                    assignment_id: assignmentId,
                    assignment_done: true,
                    completed_at: now,
                });
        }
        await fetchUserProgress(userId, courseId);
    };

    // هل أتم القسم؟
    function isSectionCompleted({ sectionId, contentIds = [], quizIds = [], assignmentIds = [] }) {
        const allContentDone = contentIds.every(id => userProgress[`content_${id}`]?.content_completed);
        const allQuizDone = quizIds.every(id => userProgress[`quiz_${id}`]?.quiz_completed);
        const allAssignmentsDone = assignmentIds.every(id => userProgress[`assignment_${id}`]?.assignment_done);
        return allContentDone && allQuizDone && allAssignmentsDone;
    }

    // كم قسم أتمه المستخدم
    function getCompletedSectionsCount(sectionsData = []) {
        return sectionsData.filter(sec => isSectionCompleted(sec)).length;
    }

    // نسبة التقدم (عدد الأقسام المكتملة / كل الأقسام)
    function calculateCourseProgress(sectionsData = []) {
        if (!sectionsData.length) return 0;
        const completed = getCompletedSectionsCount(sectionsData);
        return Math.round((completed / sectionsData.length) * 100);
    }

    return (
        <ProgressContext.Provider value={{
            userProgress,
            fetchUserProgress,
            markContentCompleted,
            markQuizCompleted,
            markAssignmentDone,
            isSectionCompleted,
            getCompletedSectionsCount,
            calculateCourseProgress
        }}>
            {children}
        </ProgressContext.Provider>
    );
}

export function useProgress() {
    return useContext(ProgressContext);
}
