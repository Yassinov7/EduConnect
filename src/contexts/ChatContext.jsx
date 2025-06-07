import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabaseClient";

const ChatContext = createContext();

export function useChat() {
    return useContext(ChatContext);
}

export function ChatProvider({ userId, children }) {
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeChatId, setActiveChatId] = useState(null);

    // الدورات التي ينتمي إليها المستخدم (للشريط الجانبي)
    const [userCourses, setUserCourses] = useState([]);
    // الأشخاص المرتبطين حسب البحث/الفلترة
    const [linkedUsers, setLinkedUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // جلب جميع المحادثات
    const fetchChats = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        const { data } = await supabase
            .from("chats")
            .select(`
        id, created_at,
        user1_id,
        user2_id,
        user1:profiles!chats_user1_id_fkey(full_name, avatar_url, user_id, role),
        user2:profiles!chats_user2_id_fkey(full_name, avatar_url, user_id, role)
      `)
            .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
        setChats(data || []);
        setLoading(false);
    }, [userId]);

    // جلب الدورات للمستخدم (للفلترة)
    const fetchUserCourses = useCallback(async () => {
        if (!userId) return [];
        const { data } = await supabase
            .from("course_enrollments")
            .select("course_id, courses(title)")
            .eq("user_id", userId);
        const courses = data?.map(d => ({ id: d.course_id, title: d.courses.title })) || [];
        setUserCourses(courses);
        return courses;
    }, [userId]);

    // جلب الأشخاص المرتبطين (طلاب أو معلمين أو طلاب دورات المعلم)
    const fetchLinkedUsers = useCallback(async (searchText = "", filterCourseId = null) => {
        setUsersLoading(true);
        // الدورات المشترك بها المستخدم (سواء طالب أو معلم)
        let courseIds = [];

        // 1. الدورات المسجل بها المستخدم (كطالب)
        const { data: myEnrollments } = await supabase
            .from("course_enrollments")
            .select("course_id")
            .eq("user_id", userId);

        if (myEnrollments?.length) {
            courseIds.push(...myEnrollments.map(e => e.course_id));
        }

        // 2. الدورات التي يدرّسها المستخدم (كمعلم)
        const { data: teachingCourses } = await supabase
            .from("courses")
            .select("id")
            .eq("teacher_id", userId);

        if (teachingCourses?.length) {
            courseIds.push(...teachingCourses.map(c => c.id));
        }

        // إزالة التكرار من courseIds
        courseIds = [...new Set(courseIds)];
        if (filterCourseId) courseIds = courseIds.filter(id => id === filterCourseId);

        if (!courseIds.length) {
            setLinkedUsers([]);
            setUsersLoading(false);
            return [];
        }

        // جلب جميع المشتركين في هذه الدورات (عدا نفسك)
        const { data: enrollments } = await supabase
            .from("course_enrollments")
            .select(`
        user_id,
        profiles(full_name, avatar_url, role, user_id),
        course_id,
        courses(title, teacher_id)
      `)
            .in("course_id", courseIds)
            .neq("user_id", userId);

        // جلب كل المعلمين لهذه الدورات (عدا نفسك كمعلم)
        const { data: courses } = await supabase
            .from("courses")
            .select("id, title, teacher_id, profiles(full_name, avatar_url, user_id)")
            .in("id", courseIds);

        // بناء خريطة مستخدمين لتجميع الدورات لكل مستخدم وعدم تكرارهم
        const usersMap = {};

        // أضف الطلاب من enrollments
        enrollments?.forEach(u => {
            if (
                searchText &&
                !u.profiles?.full_name?.toLowerCase()?.includes(searchText.toLowerCase())
            ) return;
            const id = u.user_id;
            if (!usersMap[id]) {
                usersMap[id] = {
                    user_id: id,
                    full_name: u.profiles?.full_name,
                    avatar_url: u.profiles?.avatar_url,
                    role: u.profiles?.role,
                    courses: [u.courses?.title].filter(Boolean),
                };
            } else {
                // أضف اسم الدورة إذا لم يكن مضافًا
                if (!usersMap[id].courses.includes(u.courses?.title))
                    usersMap[id].courses.push(u.courses?.title);
            }
        });

        // أضف المعلمين (غير نفسك)
        courses?.forEach(c => {
            if (
                c.teacher_id &&
                c.teacher_id !== userId &&
                c.profiles &&
                (!searchText || c.profiles.full_name?.toLowerCase().includes(searchText.toLowerCase()))
            ) {
                const id = c.teacher_id;
                if (!usersMap[id]) {
                    usersMap[id] = {
                        user_id: id,
                        full_name: c.profiles.full_name,
                        avatar_url: c.profiles.avatar_url,
                        role: "teacher",
                        courses: [c.title],
                    };
                } else {
                    if (!usersMap[id].courses.includes(c.title))
                        usersMap[id].courses.push(c.title);
                }
            }
        });

        const finalList = Object.values(usersMap);

        setLinkedUsers(finalList);
        setUsersLoading(false);
        return finalList;
    }, [userId]);

    // جلب رسائل محادثة محددة
    const fetchMessages = useCallback(async (chatId) => {
        setLoading(true);
        const { data } = await supabase
            .from("messages")
            .select("*")
            .eq("chat_id", chatId)
            .order("created_at", { ascending: true });
        setMessages(data || []);
        setLoading(false);
    }, []);

    // إرسال رسالة
    const sendMessage = async ({ chatId, content }) => {
        if (!userId) return;
        await supabase.from("messages").insert([
            {
                chat_id: chatId,
                sender_id: userId,
                content,
            },
        ]);
    };

    // بدء أو استرجاع محادثة
    const startChat = async (otherUserId) => {
        if (!userId || !otherUserId) return null;
        const [user1, user2] = userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];
        const { data: existing } = await supabase
            .from("chats")
            .select("id")
            .eq("user1_id", user1)
            .eq("user2_id", user2)
            .maybeSingle();
        if (existing) return existing.id;
        const { data } = await supabase
            .from("chats")
            .insert([{ user1_id: user1, user2_id: user2 }])
            .select("id")
            .single();
        return data?.id;
    };

    // Realtime
    // useEffect(() => {
    //     if (!activeChatId) return;
    //     const channel = supabase
    //         .channel(`messages-chat-${activeChatId}`)
    //         .on(
    //             "postgres_changes",
    //             { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${activeChatId}` },
    //             (payload) => {
    //                 // استخدم الدالة التي تأخذ الحالة الأحدث دومًا
    //                 setMessages((msgs) => {
    //                     // تحقق من عدم تكرار الرسالة (لو فيها مشكلة مزمنة)
    //                     if (msgs.some((m) => m.id === payload.new.id)) return msgs;
    //                     return [...msgs, payload.new];
    //                 });
    //             }
    //         )
    //         .subscribe();
    //     return () => {
    //         supabase.removeChannel(channel);
    //     };
    // }, [activeChatId]);

    // عند تغيير المستخدم: جلب كل شيء
    useEffect(() => {
        if (userId) {
            fetchChats();
            fetchUserCourses();
            fetchLinkedUsers();
        } else {
            setChats([]);
            setUserCourses([]);
            setLinkedUsers([]);
        }
    }, [userId, fetchChats, fetchUserCourses, fetchLinkedUsers]);

    useEffect(() => {
        if (activeChatId) {
            fetchMessages(activeChatId);
        } else {
            setMessages([]); // لو ما في محادثة، أفرغ الرسائل
        }
    }, [activeChatId, fetchMessages]);

    return (
        <ChatContext.Provider
            value={{
                chats,
                messages,
                loading,
                usersLoading,
                activeChatId,
                setActiveChatId,
                fetchChats,
                fetchMessages,
                sendMessage,
                startChat,
                fetchLinkedUsers,
                linkedUsers,
                userCourses,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}
