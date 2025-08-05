import { useChat } from "../../contexts/ChatContext";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { useRef, useEffect } from "react";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ChevronRight } from "lucide-react";

// دالة تعرض اليوم/أمس/تاريخ
function getDateLabel(date) {
    const msgDate = new Date(date);
    const now = new Date();
    const isToday = msgDate.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = msgDate.toDateString() === yesterday.toDateString();
    if (isToday) return "اليوم";
    if (isYesterday) return "أمس";
    return msgDate.toLocaleDateString("ar-EG");
}

export default function ChatWindow({
    chatId,
    otherUser,
    currentUser,
    onBack, // زر رجوع للجوال
}) {
    const { messages, loading, error } = useChat();
    const bottomRef = useRef(null);

    // Scroll للأسفل عند وصول رسالة جديدة
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, chatId]);

    // جمع الرسائل مع فاصل التواريخ
    let lastDate = null;
    const chatWithDates = [];
    messages
        .filter((msg) => msg.chat_id === chatId)
        .forEach((msg, i) => {
            const dateLabel = getDateLabel(msg.created_at);
            if (dateLabel !== lastDate) {
                chatWithDates.push({ type: "date", label: dateLabel, id: `date-${msg.id}` });
                lastDate = dateLabel;
            }
            chatWithDates.push({ ...msg, type: "msg" });
        });

    return (
        <div className="flex flex-col h-full w-full bg-white rounded-2xl md:rounded-2xl shadow-xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 border-b px-4 py-3 bg-white sticky top-0 z-10 shadow-sm min-h-[60px]">
                {onBack && (
                    <button
                        className="md:hidden mr-2 text-orange-500 p-2"
                        onClick={onBack}
                        aria-label="عودة"
                    >
                        <ChevronRight size={28} />
                    </button>
                )}
                <img
                    src={otherUser?.avatar_url || "/default-avatar.png"}
                    alt=""
                    className="w-11 h-11 rounded-full border-2 border-orange-200 object-cover"
                />
                <div className="min-w-0 flex-1">
                    <div className="font-bold text-base md:text-lg text-orange-600 truncate">{otherUser?.full_name || otherUser?.user_id || "مستخدم"}</div>
                </div>
            </div>

            {/* الرسائل */}
            <div className="flex-1 overflow-y-auto px-3 py-3 bg-orange-50" style={{ minHeight: 0 }}>
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <LoadingSpinner size="sm" />
                    </div>
                ) : error ? (
                    <div className="text-red-600 text-center">{error}</div>
                ) : !chatWithDates.length ? (
                    <div className="text-gray-400 text-center mt-8">لا توجد رسائل بعد.</div>
                ) : (
                    chatWithDates.map((item) =>
                        item.type === "date" ? (
                            <div
                                key={item.id}
                                className="flex justify-center my-2"
                            >
                                <span className="bg-orange-200 text-orange-700 px-4 py-1 rounded-2xl text-xs shadow-sm">
                                    {item.label}
                                </span>
                            </div>
                        ) : (
                            <MessageBubble
                                key={item.id}
                                message={item}
                                isOwn={item.sender_id === (currentUser?.user_id || currentUser?.id)}
                                user={otherUser}
                                currentUser={currentUser}
                            />
                        )
                    )
                )}
                <div ref={bottomRef} />
            </div>

            {/* الإدخال */}
            <div className="flex-shrink-0 border-t px-3 py-2 bg-white sticky bottom-0 z-10">
                <ChatInput chatId={chatId} />
            </div>
        </div>
    );
}