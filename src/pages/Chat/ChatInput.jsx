import { useState, useRef } from "react";
import { useChat } from "../../contexts/ChatContext";
import { Smile, Send } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

export default function ChatInput({ chatId }) {
    const [value, setValue] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const { sendMessage } = useChat();
    const inputRef = useRef();

    const handleSend = async (e) => {
        e.preventDefault();
        if (!value.trim()) return;
        await sendMessage({ chatId, content: value });
        setValue("");
        setShowEmoji(false);
        inputRef.current?.focus();
    };

    const handleEmojiClick = (emojiData) => {
        setValue((prev) => prev + emojiData.emoji);
        setShowEmoji(false);
        inputRef.current?.focus();
    };

    return (
        <form className="flex gap-2 items-center w-full relative" onSubmit={handleSend}>
            {/* زر إيموجي */}
            <button
                type="button"
                className="text-orange-400"
                tabIndex={-1}
                onClick={() => setShowEmoji((v) => !v)}
            >
                <Smile size={26} />
            </button>
            {/* Picker */}
            {showEmoji && (
                <div className="absolute bottom-12 left-0 z-50">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width={320}
                        height={350}
                        theme="light"
                        lazyLoadEmojis
                        searchDisabled
                        previewConfig={{ showPreview: false }}
                    />
                </div>
            )}

            {/* الحقل */}
            <input
                ref={inputRef}
                className="flex-1 p-3 min-w-0 rounded-xl border border-slate-200 outline-orange-400 bg-white text-base"
                placeholder="اكتب رسالة..."
                value={value}
                onChange={e => setValue(e.target.value)}
                dir="auto"
                autoComplete="off"
                onFocus={() => setShowEmoji(false)}
                style={{ maxWidth: "100%" }}
            />
            <button
                type="submit"
                className="bg-orange-500 w-14 h-13 text-white rounded-xl flex items-center justify-center font-bold text-sm"
                disabled={!value.trim()}
            >
                <Send size={20} className="mr-1" />
            </button>
        </form>
    );
}
