import { useContacts } from "../../contexts/ContactsContext";
import ChatListItem from "./ChatListItem";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function ChatSidebar({
    currentUserId,
    onSelectUser,
    selectedUser,
    openChat,
    chats
}) {
    const { contacts, courses, loading, fetchContacts } = useContacts();
    const [searchText, setSearchText] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("");

    useEffect(() => {
        fetchContacts({ roleFilter, courseId: courseFilter || null });
    }, [roleFilter, courseFilter, fetchContacts]);

    // بحث نصي
    const filteredContacts = contacts.filter(c =>
        c.full_name?.toLowerCase().includes(searchText.toLowerCase())
    );

    // دالة لإيجاد بيانات الطرف الآخر (من contacts)
    function getChatUser(chat) {
        const otherId = chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id;
        return contacts.find(c => c.user_id === otherId);
    }

    return (
        <div className="flex flex-col h-[70vh] md:h-[80vh]">
            {/* شريط بحث وفلترة */}
            <div className="mb-2">
                <div className="flex items-center bg-slate-50 rounded-xl px-2 py-2 mb-2 shadow-sm">
                    <Search size={18} className="text-orange-400 mr-1" />
                    <input
                        className="bg-transparent flex-1 outline-none text-sm"
                        placeholder="بحث بالاسم..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 mb-1">
                    <select
                        className="w-1/2 bg-slate-50 rounded-xl p-1 text-xs shadow-sm outline-none"
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                    >
                        <option value="all">الجميع</option>
                        <option value="teacher">المعلمين</option>
                        <option value="student">الطلاب</option>
                    </select>
                    <select
                        className="w-1/2 bg-slate-50 rounded-xl p-1 text-xs shadow-sm outline-none"
                        value={courseFilter}
                        onChange={e => setCourseFilter(e.target.value)}
                    >
                        <option value="">كل الدورات</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                </div>
            ) : (
                <>
                    {/* جهات الاتصال */}
                    <div className="mb-3">
                        <div className="text-slate-500 text-xs mb-1">جهات الاتصال</div>
                        <ul className="overflow-y-auto space-y-1 pr-1 max-h-[20vh] md:max-h-[22vh]">
                            {filteredContacts.map(u => (
                                <ChatListItem
                                    key={u.user_id}
                                    user={u}
                                    courses={courses}
                                    isSelected={selectedUser?.user_id === u.user_id}
                                    onClick={() => onSelectUser(u)}
                                />
                            ))}
                            {filteredContacts.length === 0 && (
                                <div className="text-xs text-gray-400 p-2 text-center">
                                    لا يوجد مطابقات
                                </div>
                            )}
                        </ul>
                    </div>

                    {/* المحادثات السابقة */}
                    <div>
                        <div className="text-slate-500 text-xs mb-1">المحادثات</div>
                        <ul className="overflow-y-auto space-y-1 pr-1 max-h-[25vh] md:max-h-[30vh]">
                            {chats.map(chat => {
                                const chatUser = getChatUser(chat);
                                return (
                                    <ChatListItem
                                        key={chat.id}
                                        user={chatUser}
                                        courses={courses}
                                        isSelected={selectedUser?.user_id === chatUser?.user_id}
                                        onClick={() => openChat(chat)}
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
                </>
            )}
        </div>
    );
}
