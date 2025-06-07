import { useChat } from "../../contexts/ChatContext";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useEffect, useRef } from "react";

export default function ChatWindow({ chatId, otherUser, currentUser }) {
    const { messages, loading } = useChat();
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex flex-col h-[70vh] md:h-[65vh] bg-white rounded-2xl shadow overflow-hidden">
            {/* رأس المحادثة */}
            <div className="flex items-center gap-3 border-b p-3 pb-2 bg-white">
                <img
                    src={otherUser?.avatar_url || "/default-avatar.png"}
                    alt=""
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-orange-200 object-cover"
                />
                <div className="min-w-0">
                    <div className="font-bold text-base md:text-lg text-orange-600 truncate">{otherUser?.full_name}</div>
                    <div className="text-xs text-gray-500 truncate">
                        {otherUser?.course_title || (otherUser?.courses?.join("، ") || "")}
                    </div>
                </div>
            </div>
            {/* سجل الرسائل */}
            <div
                className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-3 bg-slate-50"
                style={{
                    maxHeight: "calc(70vh - 96px)",
                    minHeight: "100px",
                    transition: "max-height 0.3s",
                }}
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <LoadingSpinner size="sm" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-gray-400 text-center mt-8">لا توجد رسائل بعد.</div>
                ) : (
                    messages.map(msg => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isOwn={msg.sender_id === (currentUser?.user_id || currentUser?.id)}
                            user={otherUser}
                            currentUser={currentUser}
                        />
                    ))
                )}
                <div ref={bottomRef} />
            </div>
            {/* إدخال الرسالة */}
            <div className="border-t p-2 md:p-3  bg-white">
                <ChatInput chatId={chatId} />
            </div>
        </div>
    );
}
