import { useState } from "react";
import { useChat } from "../../contexts/ChatContext";
import Button from "../../components/ui/Button";
import { Send } from "lucide-react";

export default function ChatInput({ chatId }) {
    const [value, setValue] = useState("");
    const { sendMessage, loading } = useChat();

    const handleSend = async (e) => {
        e.preventDefault();
        if (!value.trim()) return;
        await sendMessage({ chatId, content: value });
        setValue("");
    };

    return (
        <form className="flex gap-2 items-center w-full" onSubmit={handleSend}>
            <input
                className="flex-1 p-3 min-w-0 rounded-xl border border-slate-200 outline-orange-400 bg-white text-base"
                placeholder="اكتب رسالة..."
                value={value}
                onChange={e => setValue(e.target.value)}
                disabled={loading}
                onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) handleSend(e);
                }}
            />
            <Button
                type="submit"
                className="!bg-orange-500 w-20 h-13 !text-white !shadow-none px-4 py-2"
                disabled={!value.trim() || loading}
            >
                <Send size={18} className="mr-1" /> إرسال
            </Button>
        </form>
    );
}
