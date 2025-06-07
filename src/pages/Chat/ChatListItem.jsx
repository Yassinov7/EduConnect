export default function ChatListItem({ user, isSelected, onClick }) {
    return (
        <li
            className={`flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer transition
        ${isSelected ? "bg-orange-50 shadow" : "hover:bg-orange-100"}`}
            onClick={onClick}
        >
            <img
                src={user.avatar_url || "/default-avatar.png"}
                alt=""
                className="w-10 h-10 rounded-full border-2 border-orange-200 object-cover"
            />
            <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-800 text-base truncate">{user.full_name}</div>
                <div className="text-xs text-slate-500 truncate">{user.course_title || "دورة مشتركة"}</div>
            </div>
            {user.role === "teacher" && (
                <span className="bg-orange-100 text-orange-700 rounded-full px-2 py-0.5 text-xs">معلم</span>
            )}
        </li>
    );
}
