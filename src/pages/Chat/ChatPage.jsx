import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { useChat } from "../../contexts/ChatContext";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { toast } from "sonner";

const NAVBAR_HEIGHT = 80;

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

  // Handle window resize for sidebar visibility
  useEffect(() => {
    const handleResize = () => setShowSidebar(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sort chats by last message
  const sortedChats = [...chats].sort((a, b) => {
    const aLast = messages.filter((m) => m.chat_id === a.id).slice(-1)[0]?.created_at || a.created_at;
    const bLast = messages.filter((m) => m.chat_id === b.id).slice(-1)[0]?.created_at || b.created_at;
    return new Date(bLast) - new Date(aLast);
  });

  const handleOpenChat = (chat) => {
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
  if (error) return <div className="text-red-600 text-center p-4">{error}</div>;

  return (
    <div className="flex w-full h-[calc(100vh-80px)] bg-slate-50 shadow-lg rounded-2xl overflow-hidden min-h-full">
      {/* Mobile sidebar toggle */}
      {!showSidebar && (
        <button
          className="md:hidden fixed top-22 right-4 z-40 w-12 h-12 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
          onClick={() => setShowSidebar(true)}
          aria-label="فتح القائمة الجانبية"
        >
          <span className="text-2xl">☰</span>
        </button>
      )}

      {/* Overlay for mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setShowSidebar(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          z-40 md:static fixed right-0 top-0 h-full w-80 max-w-full
          bg-white flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out
          ${showSidebar ? "translate-x-0" : "translate-x-full"}
          md:translate-x-0 md:shadow-none shadow-2xl md:rounded-s-2xl
        `}
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
      <main className="flex-1 flex flex-col h-full max-w-full">
        {activeChatId && selectedUser ? (
          <ChatWindow
            key={activeChatId}
            chatId={activeChatId}
            otherUser={selectedUser}
            currentUser={profile}
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