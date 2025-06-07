import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../services/supabaseClient"; // غيّر حسب مسار مشروعك

const ChatContext = createContext();

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ userId, children }) {
  const [chats, setChats] = useState([]);
  const [messagesMap, setMessagesMap] = useState({}); // key = chatId, value = messages[]
  const [activeChatId, setActiveChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- تحميل المحادثات ---
  const fetchChats = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
    if (error) setError(error.message);
    setChats(data || []);
    setLoading(false);
  }, [userId]);

  // --- تحميل رسائل محادثة واحدة فقط ---
  const fetchMessages = useCallback(
    async (chatId) => {
      if (!chatId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      if (error) setError(error.message);
      setMessagesMap((prev) => ({ ...prev, [chatId]: data || [] }));
      setLoading(false);
    },
    []
  );

  // --- إرسال رسالة جديدة ---
  const sendMessage = async ({ chatId, content }) => {
    if (!userId || !chatId || !content) return;
    const { error } = await supabase
      .from("messages")
      .insert([{ chat_id: chatId, sender_id: userId, content }]);
    if (error) setError(error.message);
    // لا تضف الرسالة يدويًا، الريل تايم سيضيفها فورًا
  };

  // --- بدء أو جلب محادثة خاصة ---
  const startChat = async (otherUserId) => {
    if (!userId || !otherUserId) return null;
    const [user1, user2] = userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];
    const { data: existing, error: findErr } = await supabase
      .from("chats")
      .select("id")
      .eq("user1_id", user1)
      .eq("user2_id", user2)
      .maybeSingle();
    if (findErr) { setError(findErr.message); return null; }
    if (existing) return existing.id;
    const { data, error: createErr } = await supabase
      .from("chats")
      .insert([{ user1_id: user1, user2_id: user2 }])
      .select("id")
      .single();
    if (createErr) { setError(createErr.message); return null; }
    return data?.id;
  };

  // --- اشتراك الريل تايم الخاص بالمحادثة المفتوحة فقط ---
  const channelRef = useRef(null);

  useEffect(() => {
    if (!activeChatId) return;
    fetchMessages(activeChatId);

    // إلغاء اشتراك القناة السابقة
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // اشترك على رسائل هذه المحادثة فقط
    const channel = supabase
      .channel(`realtime-messages-${activeChatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${activeChatId}` },
        (payload) => {
          setMessagesMap((prev) => {
            const prevMsgs = prev[activeChatId] || [];
            if (prevMsgs.some((m) => m.id === payload.new.id)) return prev;
            return {
              ...prev,
              [activeChatId]: [...prevMsgs, payload.new]
            };
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line
  }, [activeChatId]);

  // --- عند تغيير المستخدم، حمّل المحادثات ---
  useEffect(() => {
    if (userId) fetchChats();
    // eslint-disable-next-line
  }, [userId]);

  // جميع الرسائل للمحادثة الحالية
  const messages = activeChatId ? messagesMap[activeChatId] || [] : [];

  return (
    <ChatContext.Provider
      value={{
        chats,
        messages,
        loading,
        error,
        activeChatId,
        setActiveChatId,
        sendMessage,
        startChat,
        fetchChats,    // لو احتجتها لاحقًا
        fetchMessages, // لو أردت تحميل رسائل أكثر مستقبلاً
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
