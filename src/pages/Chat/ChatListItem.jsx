// ChatListItem.jsx
export default function ChatListItem({ user, courses = [], isSelected, onClick }) {
    if (!user) return null;
    // عرض اسم الدورة أو جميع الدورات
    let subTitle = "";
    if (user.role === "teacher") {
        subTitle = "معلم";
    } else if (user.course_title) {
        subTitle = user.course_title;
    } else if (user.courses && Array.isArray(user.courses)) {
        // استخدم courses من props لاستخراج العنوان من id
        const courseTitles = user.courses
            .map(cid => courses.find(c => c.id === cid)?.title)
            .filter(Boolean)
            .join("، ");
        subTitle = courseTitles || "دورة مشتركة";
    } else {
        subTitle = "دورة مشتركة";
    }

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
                <div className="text-xs text-slate-500 truncate">{subTitle}</div>
            </div>
            {user.role === "teacher" && (
                <span className="bg-orange-100 text-orange-700 rounded-full px-2 py-0.5 text-xs">معلم</span>
            )}
        </li>
    );
}
