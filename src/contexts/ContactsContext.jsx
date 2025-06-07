import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabaseClient";

const ContactsContext = createContext();

export function useContacts() {
    return useContext(ContactsContext);
}

// دالة لدمج الطلاب المتكررين وتجميع دوراتهم
function mergeContacts(arr) {
    const map = {};
    for (const c of arr) {
        if (!map[c.user_id]) {
            map[c.user_id] = { ...c, courses: [] };
        }
        if (c.course_id && !map[c.user_id].courses.includes(c.course_id)) {
            map[c.user_id].courses.push(c.course_id);
        }
    }
    return Object.values(map);
}

export function ContactsProvider({ currentUser, children }) {
    const [contacts, setContacts] = useState([]);
    const [courses, setCourses] = useState([]); // كل الدورات الخاصة بالمستخدم
    const [loading, setLoading] = useState(false);

    // جلب الدورات الخاصة بالمستخدم (تستخدم فقط للعرض)
    const fetchCourses = useCallback(async () => {
        if (!currentUser) return [];
        if (currentUser.role === "teacher") {
            const { data } = await supabase
                .from("courses")
                .select("id, title")
                .eq("teacher_id", currentUser.user_id);
            setCourses(data || []);
            return data || [];
        } else {
            const { data } = await supabase
                .from("course_enrollments")
                .select("course_id, courses(title)")
                .eq("user_id", currentUser.user_id);
            const coursesData = data?.map(e => ({
                id: e.course_id,
                title: e.courses?.title,
            })) || [];
            setCourses(coursesData);
            return coursesData;
        }
    }, [currentUser]);

    // جلب جهات الاتصال مع دمج الطلاب المشتركين بعدة دورات
    const fetchContacts = useCallback(
        async ({ roleFilter = "all", courseId = null } = {}) => {
            if (!currentUser) return;
            setLoading(true);

            // 1. جلب جميع المعلمين
            let teachers = [];
            if (roleFilter === "teacher" || roleFilter === "all") {
                const { data } = await supabase
                    .from("profiles")
                    .select("user_id, full_name, avatar_url, role")
                    .eq("role", "teacher");
                teachers = data || [];
            }

            // 2. جلب الطلاب (المشتركين في دوراتي أو بدوراتي إن كنت طالب)
            let students = [];
            if (roleFilter === "student" || roleFilter === "all") {
                let courseIds = [];
                if (currentUser.role === "teacher") {
                    // جلب الدورات التي أدرّسها
                    const { data: myCourses } = await supabase
                        .from("courses")
                        .select("id")
                        .eq("teacher_id", currentUser.user_id);
                    courseIds = myCourses?.map(c => c.id) || [];
                } else {
                    // جلب الدورات المسجل بها
                    const { data: myCourses } = await supabase
                        .from("course_enrollments")
                        .select("course_id")
                        .eq("user_id", currentUser.user_id);
                    courseIds = myCourses?.map(c => c.course_id) || [];
                }

                // جلب الطلاب في هذه الدورات
                if (courseIds.length) {
                    let query = supabase
                        .from("course_enrollments")
                        .select("user_id, profiles(full_name, avatar_url, role, user_id), course_id")
                        .in("course_id", courseIds);
                    if (courseId) query = query.eq("course_id", courseId);

                    const { data: enrolled } = await query;
                    students = (enrolled || [])
                        .filter(e => e.user_id !== currentUser.user_id)
                        .map(e => ({
                            user_id: e.user_id,
                            full_name: e.profiles?.full_name,
                            avatar_url: e.profiles?.avatar_url,
                            role: e.profiles?.role,
                            course_id: e.course_id,
                        }));
                }
            }

            // دمج الطلاب المتكررين وتجميع دوراتهم
            let mergedStudents = mergeContacts(students);

            // دمج المعلمين مع الطلاب (المعلمين دائمًا بدون courses)
            let allContacts = [...teachers, ...mergedStudents];

            setContacts(allContacts);
            setLoading(false);
            return allContacts;
        },
        [currentUser]
    );

    // تحميل أولي عند تغيير المستخدم
    useEffect(() => {
        fetchCourses();
        fetchContacts();
    }, [currentUser, fetchCourses, fetchContacts]);

    return (
        <ContactsContext.Provider
            value={{
                contacts,
                courses,
                loading,
                fetchContacts,
                fetchCourses,
            }}
        >
            {children}
        </ContactsContext.Provider>
    );
}
