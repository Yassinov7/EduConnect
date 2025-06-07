import { useState } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { useChat } from "../../contexts/ChatContext";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import Card from "../../components/ui/Card";

export default function ChatPage() {
  const { user, profile } = useAuth();
  const { startChat, activeChatId, setActiveChatId } = useChat();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false); // للجوال

  // عند اختيار مستخدم
  const handleSelectUser = async (userInfo) => {
    setSelectedUser(userInfo);
    const chatId = await startChat(userInfo.user_id);
    setActiveChatId(chatId);
    setShowSidebar(false); // إخفاء القائمة على الجوال بعد الاختيار
  };

  if (!user) return <LoadingSpinner text="جاري تحميل المستخدم..." />;

  return (
    <div className="noto min-h-screen bg-slate-100 pt-16 pb-4 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-3 md:gap-4 min-h-[400px] relative">

        {/* زر القائمة الجانبية على الجوال */}
        <button
          className="md:hidden fixed top-20 left-3 z-30 bg-orange-500 text-white rounded-full p-2 shadow-lg"
          onClick={() => setShowSidebar(v => !v)}
        >
          ☰
        </button>

        {/* Sidebar */}
        <div
          className={`
            fixed inset-0 z-20 bg-black/40 transition md:static md:z-auto md:bg-transparent
            ${showSidebar ? "block" : "hidden"} md:block
          `}
          onClick={() => setShowSidebar(false)}
        >
          <Card
            className={`
              h-full max-h-[80vh] w-11/12 mx-auto mt-6
              md:mt-0 md:mx-0 md:w-full md:max-w-xs md:relative
              shadow-xl md:shadow
              p-0
              ${showSidebar ? "block" : "hidden"} md:block
            `}
            onClick={e => e.stopPropagation()} // منع إغلاق عند النقر داخل القائمة
          >
            <ChatSidebar
              currentUserId={user.id}
              onSelectUser={handleSelectUser}
              selectedUser={selectedUser}
            />
          </Card>
        </div>

        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col mt-4 md:mt-0">
          {activeChatId && selectedUser ? (
            <ChatWindow
              key={activeChatId}
              chatId={activeChatId}
              otherUser={selectedUser}
              currentUser={profile}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-400 text-lg">
              اختر شخصًا من القائمة لبدء محادثة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
