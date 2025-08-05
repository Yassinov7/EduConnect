
import { useContacts } from "../../contexts/ContactsContext";
import ChatListItem from "./ChatListItem";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Search, X, Plus, MessageCircle } from "lucide-react";
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
    const [showContacts, setShowContacts] = useState(false);

    useEffect(() => {
        fetchContacts({ roleFilter, courseId: courseFilter || null });
    }, [roleFilter, courseFilter, fetchContacts]);

    // Filter contacts by search text
    const filteredContacts = contacts.filter((c) =>
        c.full_name?.toLowerCase().includes(searchText.toLowerCase())
    );

    // Filter chats by search text (based on chat user's full_name)
    const filteredChats = chats.filter((chat) => {
        const chatUser = getChatUser(chat);
        return chatUser?.full_name?.toLowerCase().includes(searchText.toLowerCase());
    });

    function getChatUser(chat) {
        const otherId = chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id;
        return contacts.find((c) => c.user_id === otherId);
    }

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
        <aside className="bg-white flex flex-col w-full h-full md:rounded-2xl md:shadow-xl md:border border-gray-200 transition-all">
            {/* Mobile header */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-30 border-b border-gray-100">
                <button
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 shadow-md transition-colors"
                    onClick={onCloseMobile}
                    aria-label="إغلاق القائمة الجانبية"
                    type="button"
                >
                    <X size={20} />
                </button>
                <div className="text-orange-600 text-base font-semibold">
                    قائمة المحادثات
                </div>
                <div className="w-8" /> {/* Spacer for alignment */}
            </div>

            {/* Toggle button and search/filters */}
            <div className="pt-4 pb-3 px-4 bg-white sticky top-0 z-20 md:top-0">
                <button
                    className="flex items-center gap-2 w-full bg-orange-500 text-white px-4 py-2.5 rounded-xl hover:bg-orange-600 transition-colors shadow-md mb-3"
                    onClick={() => setShowContacts(!showContacts)}
                    aria-expanded={showContacts}
                    aria-label={showContacts ? "عرض المحادثات السابقة" : "بدء محادثة جديدة"}
                >
                    {showContacts ? (
                        <>
                            <MessageCircle size={18} />
                            <span className="text-sm font-semibold">عرض المحادثات</span>
                        </>
                    ) : (
                        <>
                            <Plus size={18} />
                            <span className="text-sm font-semibold">بدء محادثة جديدة</span>
                        </>
                    )}
                </button>
                <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 mb-3 shadow-sm">
                    <Search size={18} className="text-orange-500 mr-2" />
                    <input
                        className="bg-transparent flex-1 outline-none text-sm text-gray-800 placeholder-gray-400"
                        placeholder="بحث بالاسم..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        aria-label="البحث عن جهة اتصال أو محادثة"
                    />
                </div>
                <div className="flex gap-3">
                    <select
                        className="w-1/2 bg-gray-100 rounded-xl p-2 text-sm outline-none hover:bg-gray-200 transition-colors"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        aria-label="تصفية حسب الدور"
                    >
                        <option value="all">الجميع</option>
                        <option value="teacher">المعلمين</option>
                        <option value="student">الطلاب</option>
                    </select>
                    <select
                        className="w-1/2 bg-gray-100 rounded-xl p-2 text-sm outline-none hover:bg-gray-200 transition-colors"
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        aria-label="تصفية حسب الدورة"
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

            {/* Contacts and chats list */}
            <div className="flex-1 flex flex-col overflow-y-auto px-4 pb-4">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <LoadingSpinner size="sm" />
                    </div>
                ) : (
                    <>
                        {/* Previous chats */}
                        {!showContacts && (
                            <div className="animate-slide-down">
                                <div className="text-gray-500 text-sm font-semibold mt-4 mb-2 px-2">المحادثات</div>
                                <ul className="space-y-2">
                                    {filteredChats.length === 0 ? (
                                        <div className="text-sm text-gray-400 p-2 text-center">
                                            لا توجد محادثات مطابقة
                                        </div>
                                    ) : (
                                        filteredChats.map((chat) => {
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
                                        })
                                    )}
                                </ul>
                            </div>
                        )}
                        {/* Contacts */}
                        {showContacts && (
                            <div className="mt-4 animate-slide-down">
                                <div className="text-gray-500 text-sm font-semibold mb-2 px-2">جهات الاتصال</div>
                                <ul className="space-y-2">
                                    {filteredContacts.length === 0 ? (
                                        <div className="text-sm text-gray-400 p-2 text-center">
                                            لا يوجد مطابقات
                                        </div>
                                    ) : (
                                        filteredContacts.map((u) => (
                                            <ChatListItem
                                                key={u.user_id}
                                                user={u}
                                                courses={courses}
                                                isSelected={selectedUser?.user_id === u.user_id}
                                                onClick={() => handleContactClick(u)}
                                            />
                                        ))
                                    )}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Custom animation for slide-down effect */}
            <style jsx>{`
        .animate-slide-down {
          animation: slideDown 0.3s ease-in-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </aside>
    );
}