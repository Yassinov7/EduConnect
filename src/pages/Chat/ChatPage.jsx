import { useState } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { useChat } from "../../contexts/ChatContext";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { toast } from "sonner";

const NAVBAR_HEIGHT = 80;
const BOTTOMNAV_HEIGHT = 64;

export default function ChatPage() {
  const { user, profile } = useAuth();
  const {
    chats,
    messages,
    activeChatId,
    setActiveChatId,
    startChat,
    loading,
    error,
  } = useChat();

  const [selectedUser, setSelectedUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);

  // ترتيب المحادثات حسب آخر رسالة
  const sortedChats = [...chats].sort((a, b) => {
    const aLast = messages.filter(m => m.chat_id === a.id).slice(-1)[0]?.created_at || a.created_at;
    const bLast = messages.filter(m => m.chat_id === b.id).slice(-1)[0]?.created_at || b.created_at;
    return new Date(bLast) - new Date(aLast);
  });

  // سايدبار responsive عند تغيير حجم الشاشة
  // اجعل السايدبار ظاهرًا دائمًا على الديسكتوب
  window.onresize = () => {
    if (window.innerWidth >= 768) setShowSidebar(true);
  };

  const handleOpenChat = chat => {
    setActiveChatId(chat.id);
    const contact = chat.user1_id === user.id ? chat.user2 : chat.user1;
    setSelectedUser(contact);
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  const handleSelectUser = async (userInfo) => {
    try {
      const chatId = await startChat(userInfo.user_id);
      setActiveChatId(chatId);
      setSelectedUser(userInfo);
      if (window.innerWidth < 768) setShowSidebar(false);
    } catch {
      toast.error("تعذر بدء المحادثة!");
    }
  };

  if (!user) return <LoadingSpinner text="جاري تحميل المستخدم..." />;
  if (loading) return <LoadingSpinner text="تحميل المحادثات..." />;
  if (error) return <div className="text-red-600 text-center">{error}</div>;

  const pageHeight = `calc(100vh - ${NAVBAR_HEIGHT}px - ${BOTTOMNAV_HEIGHT}px)`;

  return (
    <div className="flex w-full h-[calc(100vh-80px-64px)] bg-slate-50 relative">
      {/* زر القائمة الجانبية للجوال */}
      {!showSidebar && (
        <button
          className="md:hidden fixed top-24 right-4 z-40 w-12 h-12 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center"
          onClick={() => setShowSidebar(true)}
        >
          <span className="text-2xl">☰</span>
        </button>
      )}

      {/* Overlay خلفية سوداء للجوال فقط */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          z-40 md:static fixed right-0 top-0 h-full w-80 max-w-full
          bg-white flex-shrink-0 flex flex-col transition-transform
          ${showSidebar ? "translate-x-0" : "translate-x-full"}
          md:translate-x-0 md:shadow-none shadow-2xl
          md:h-full md:rounded-s-2xl
        `}
        style={{
          minHeight: "100%",
          height: "100%",
          borderRadius: window.innerWidth < 768 ? "0px" : "1.25rem",
        }}
      >
        <ChatSidebar
          currentUserId={user.id}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          onSelectUser={handleSelectUser}
          openChat={handleOpenChat}
          chats={sortedChats}
          onCloseMobile={() => setShowSidebar(false)}
        />
      </aside>

      {/* Main Chat Window */}
      <main className="flex-1 flex flex-col h-full max-w-full relative">
        {activeChatId && selectedUser ? (
          <ChatWindow
            key={activeChatId}
            chatId={activeChatId}
            otherUser={selectedUser}
            currentUser={profile}
            pageHeight={pageHeight}
            navbarHeight={NAVBAR_HEIGHT}
            bottomnavHeight={BOTTOMNAV_HEIGHT}
            onBack={() => setShowSidebar(true)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400 text-xl font-semibold">
            اختر محادثة أو ابدأ جديدة من القائمة
          </div>
        )}
      </main>
    </div>
  );
}
