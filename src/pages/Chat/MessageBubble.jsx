export default function MessageBubble({ message, isOwn, currentUser, user }) {
    return (
        <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] p-3 rounded-2xl shadow
        ${isOwn ? "bg-orange-100 text-right text-orange-900 rounded-br-none" : "bg-white text-slate-800 rounded-bl-none"}
        flex flex-col gap-1`}>
                <div className="text-sm break-words">{message.content}</div>
                <div className="text-xs text-gray-400 mt-1 text-left ltr:text-right">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
            </div>
        </div>
    );
}
