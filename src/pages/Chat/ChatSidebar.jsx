import { useState, useEffect } from "react";
import { useChat } from "../../contexts/ChatContext";
import ChatListItem from "./ChatListItem";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Search } from "lucide-react";

export default function ChatSidebar({ currentUserId, onSelectUser, selectedUser }) {
    const {
        fetchLinkedUsers,
        linkedUsers,
        usersLoading,
        userCourses,
    } = useChat();

    const [searchText, setSearchText] = useState("");
    const [filterCourseId, setFilterCourseId] = useState(null);

    useEffect(() => {
        fetchLinkedUsers(searchText, filterCourseId);
    }, [searchText, filterCourseId, fetchLinkedUsers]);

    return (
        <div className="flex flex-col h-[70vh]">
            <div className="mb-3">
                <div className="flex items-center bg-slate-50 rounded-xl px-2 py-2 mb-2 shadow-sm">
                    <Search size={18} className="text-orange-400 mr-1" />
                    <input
                        className="bg-transparent flex-1 outline-none text-sm"
                        placeholder="بحث بالاسم..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                </div>
                <select
                    className="w-full mt-1 bg-slate-50 rounded-xl p-2 text-xs shadow-sm outline-none"
                    value={filterCourseId || ""}
                    onChange={e => setFilterCourseId(e.target.value || null)}
                >
                    <option value="">كل الدورات</option>
                    {userCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                </select>
            </div>
            {usersLoading ? (
                <div className="flex-1 flex items-center justify-center"><LoadingSpinner size="sm" /></div>
            ) : linkedUsers.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                    لا يوجد أشخاص متاحين للمحادثة
                </div>
            ) : (
                <ul className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[60vh]">
                    {linkedUsers.map(u => (
                        <ChatListItem
                            key={u.user_id}
                            user={u}
                            isSelected={selectedUser?.user_id === u.user_id}
                            onClick={() => onSelectUser(u)}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}
