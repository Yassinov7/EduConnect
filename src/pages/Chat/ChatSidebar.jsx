import { useContacts } from "../../contexts/ContactsContext";
import ChatListItem from "./ChatListItem";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function ChatSidebar({
    currentUserId,
    onSelectUser,
    selectedUser,
    setSelectedUser,
    openChat,
    chats,
    onCloseMobile,
}) {
    const { contacts, courses, loading, fetchContacts } = useContacts();
    const [searchText, setSearchText] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("");

    useEffect(() => {
        fetchContacts({ roleFilter, courseId: courseFilter || null });
    }, [roleFilter, courseFilter, fetchContacts]);

    // فلترة البحث
    const filteredContacts = contacts.filter((c) =>
        c.full_name?.toLowerCase().includes(searchText.toLowerCase())
    );

    function getChatUser(chat) {
        const otherId = chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id;
        return contacts.find((c) => c.user_id === otherId);
    }

    // عند ضغط محادثة أو جهة اتصال
    const handleChatClick = (chat) => {
        openChat(chat);
        const chatUser = getChatUser(chat);
        if (chatUser) setSelectedUser(chatUser);
        if (window.innerWidth < 768 && typeof onCloseMobile === "function") {
            onCloseMobile();
        }
    };
    const handleContactClick = (contact) => {
        onSelectUser(contact);
        if (window.innerWidth < 768 && typeof onCloseMobile === "function") {
            onCloseMobile();
        }
    };

    return (
        <aside
            className={`
        bg-white flex flex-col w-full md:max-w-xs h-full md:rounded-2xl md:shadow-xl relative transition-all
        ${window.innerWidth < 768 ? "" : "border-slate-200 border"}
      `}
            style={{
                minHeight: "100%",
                maxHeight: "100vh",
                borderRadius: window.innerWidth < 768 ? "0" : "1.25rem",
                boxShadow: window.innerWidth < 768 ? "none" : "",
            }}
        >
            {/* زر إغلاق للجوال فقط */}
            <button
                className="md:hidden absolute top-4 left-4 z-40 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 shadow"
                onClick={onCloseMobile}
                aria-label="إغلاق القائمة"
                type="button"
            >
                <X size={24} />
            </button>

            {/* شريط البحث والفلترة */}
            <div className="pt-7 pb-3 px-4 bg-white sticky top-0 z-20">
                <div className="flex items-center bg-slate-100 rounded-xl px-2 py-2 mb-2">
                    <Search size={18} className="text-orange-400 mr-1" />
                    <input
                        className="bg-transparent flex-1 outline-none text-sm"
                        placeholder="بحث بالاسم..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 mb-1">
                    <select
                        className="w-1/2 bg-slate-100 rounded-xl p-1 text-xs outline-none"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">الجميع</option>
                        <option value="teacher">المعلمين</option>
                        <option value="student">الطلاب</option>
                    </select>
                    <select
                        className="w-1/2 bg-slate-100 rounded-xl p-1 text-xs outline-none"
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                    >
                        <option value="">كل الدورات</option>
                        {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* قائمة جهات الاتصال والمحادثات */}
            <div className="flex-1 flex flex-col overflow-y-auto px-2 pb-4">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <LoadingSpinner size="sm" />
                    </div>
                ) : (
                    <>
                        {/* المحادثات السابقة */}
                        <div>
                            <div className="text-slate-500 text-xs mb-1 px-2">المحادثات</div>
                            <ul className="space-y-1">
                                {chats.map((chat) => {
                                    const chatUser = getChatUser(chat);
                                    return (
                                        <ChatListItem
                                            key={chat.id}
                                            user={chatUser}
                                            courses={courses}
                                            isSelected={selectedUser?.user_id === chatUser?.user_id}
                                            onClick={() => handleChatClick(chat)}
                                        />
                                    );
                                })}
                                {chats.length === 0 && (
                                    <div className="text-xs text-gray-400 p-2 text-center">
                                        لا توجد محادثات بعد
                                    </div>
                                )}
                            </ul>
                        </div>
                        {/* جهات الاتصال */}
                        <div className="mb-3">
                            <div className="text-slate-500 text-xs mb-1 px-2">محادثة جديدة</div>
                            <ul className="space-y-1">
                                {filteredContacts.map((u) => (
                                    <ChatListItem
                                        key={u.user_id}
                                        user={u}
                                        courses={courses}
                                        isSelected={selectedUser?.user_id === u.user_id}
                                        onClick={() => handleContactClick(u)}
                                    />
                                ))}
                                {filteredContacts.length === 0 && (
                                    <div className="text-xs text-gray-400 p-2 text-center">
                                        لا يوجد مطابقات
                                    </div>
                                )}
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
}
