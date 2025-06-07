import { useChat } from "../../contexts/ChatContext";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { useRef, useEffect } from "react";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

export default function ChatWindow({
    chatId,
    otherUser,
    currentUser,
    pageHeight = "80vh",
    navbarHeight = 80,
    bottomnavHeight = 64
}) {
    const { messages, loading, error } = useChat();
    const bottomRef = useRef(null);

    // Scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, chatId]);

    return (
        <div
            className="relative flex flex-col w-full bg-white rounded-2xl shadow overflow-hidden"
            style={{
                height: "100%",
                minHeight: "100%",
                maxHeight: "100%",
                display: "flex",
            }}
        >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center gap-3 border-b p-3 pb-2 bg-white sticky top-0 z-10"
                style={{ minHeight: 64, maxHeight: 72 }}>
                <img
                    src={otherUser?.avatar_url || "/default-avatar.png"}
                    alt=""
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-orange-200 object-cover"
                />
                <div className="min-w-0 flex-1">
                    <div className="font-bold text-base md:text-lg text-orange-600 truncate">{otherUser?.full_name || otherUser?.user_id || "مستخدم"}</div>
                </div>
            </div>
            {/* Messages */}
            <div
                className="flex-1 overflow-y-auto px-2 md:px-4 py-2 md:py-3 bg-slate-50"
                style={{
                    minHeight: 0,
                    maxHeight: `calc(${pageHeight} - 128px)`, // 64px header + 64px input
                    transition: "max-height 0.2s"
                }}
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <LoadingSpinner size="sm" />
                    </div>
                ) : error ? (
                    <div className="text-red-600 text-center">{error}</div>
                ) : !messages.length ? (
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
            {/* Input */}
            <div
                className="flex-shrink-0 border-t px-2 md:px-3 py-2 bg-white sticky bottom-0 z-10"
                style={{
                    minHeight: 56,
                    maxHeight: 72,
                }}
            >
                <ChatInput chatId={chatId} />
            </div>
        </div>
    );
}
