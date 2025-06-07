import React from "react";

// دالة بسيطة لإظهار الوقت
function formatTime(date) {
    const d = new Date(date);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// خيار: يمكنك استبدالها ب prettier emoji render مثل twemoji إذا أردت
function renderWithEmoji(text) {
    // أي نص فيه إيموجي سيظهر، أو يمكنك استخدام مكتبة مثل "emoji-mart" لعرض أدق.
    return text.split(/(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu).map((part, i) => (
        <span key={i} style={{ fontSize: part.match(/\p{Emoji}/u) ? "1.7em" : "1em" }}>
            {part}
        </span>
    ));
}

export default function MessageBubble({ message, isOwn, user, currentUser }) {
    return (
        <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
            <div className={`
        max-w-[78vw] sm:max-w-md break-words px-4 py-2 rounded-2xl shadow-sm
        ${isOwn
                    ? "bg-orange-100 text-right rounded-br-none border border-orange-200"
                    : "bg-white text-right rounded-bl-none border border-slate-200"
                }
        flex flex-col gap-1
      `}>
                {/* يمكنك عرض اسم المرسل في المحادثات الجماعية فقط */}
                {/* <div className="text-xs text-slate-500 font-bold">{isOwn ? "أنت" : user?.full_name}</div> */}
                <div className="text-base leading-6 break-words" dir="auto">
                    {renderWithEmoji(message.content)}
                </div>
                <div className={`text-[11px] text-slate-400 mt-1 flex items-center gap-1 justify-${isOwn ? "end" : "start"}`}>
                    <span>{formatTime(message.created_at)}</span>
                </div>
            </div>
        </div>
    );
}
