import { useState } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { useChat } from "../../contexts/ChatContext";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import Card from "../../components/ui/Card";
import { toast } from "sonner";

const NAVBAR_HEIGHT = 80;
const BOTTOMNAV_HEIGHT = 64;

export default function ChatPage() {
  const { user, profile } = useAuth();
  const {
    chats,
    activeChatId,
    setActiveChatId,
    messages,
    startChat,
    loading,
    error,
  } = useChat();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // ترتيب المحادثات حسب آخر رسالة (اختياري)
  const sortedChats = [...chats].sort((a, b) => {
    const aLast = (messages.filter(m => m.chat_id === a.id).slice(-1)[0]?.created_at) || a.created_at;
    const bLast = (messages.filter(m => m.chat_id === b.id).slice(-1)[0]?.created_at) || b.created_at;
    return new Date(bLast) - new Date(aLast);
  });

  const handleOpenChat = (chat) => {
    setActiveChatId(chat.id);
    const contact = chat.user1_id === user.id ? chat.user2 : chat.user1;
    setSelectedUser(contact);
    setShowSidebar(false);
  };

  const handleSelectUser = async (userInfo) => {
    try {
      const chatId = await startChat(userInfo.user_id);
      setActiveChatId(chatId);
      setSelectedUser(userInfo);
      setShowSidebar(false);
    } catch (err) {
      toast.error("تعذر بدء المحادثة!");
    }
  };

  if (!user) return <LoadingSpinner text="جاري تحميل المستخدم..." />;
  if (loading) return <LoadingSpinner text="تحميل المحادثات..." />;
  if (error) return <div className="text-red-600 text-center">{error}</div>;

  const pageHeight = `calc(100vh - ${NAVBAR_HEIGHT}px - ${BOTTOMNAV_HEIGHT}px)`;

  return (
    <div
      className="noto bg-slate-100 flex flex-col items-center"
      style={{
        minHeight: pageHeight,
        maxHeight: pageHeight,
        paddingTop: NAVBAR_HEIGHT,
        paddingBottom: BOTTOMNAV_HEIGHT,
        overflow: "hidden"
      }}
    >
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-3 md:gap-4 min-h-[400px] relative"
        style={{
          height: "100%",
          minHeight: "400px"
        }}
      >

        {/* زر القائمة الجانبية للجوال */}
        <button
          className="md:hidden fixed top-20 right-3 z-30 w-10 h-10 mt-3 bg-orange-500 text-white rounded-full p-2 shadow-lg"
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
            onClick={e => e.stopPropagation()}
          >
            <ChatSidebar
              currentUserId={user.id}
              onSelectUser={handleSelectUser}
              selectedUser={selectedUser}
              openChat={handleOpenChat}
              chats={sortedChats}
            />
          </Card>
        </div>

        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col mt-4 md:mt-0" style={{ minHeight: "100%", height: "100%" }}>
          {activeChatId && selectedUser ? (
            <ChatWindow
              key={activeChatId}
              chatId={activeChatId}
              otherUser={selectedUser}
              currentUser={profile}
              pageHeight={pageHeight}
              navbarHeight={NAVBAR_HEIGHT}
              bottomnavHeight={BOTTOMNAV_HEIGHT}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-400 text-lg">
              اختر محادثة أو ابدأ محادثة جديدة من القائمة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
