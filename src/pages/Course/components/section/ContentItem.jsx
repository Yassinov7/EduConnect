// components/section/ContentItem.jsx
import { File, Download, Image, Video as VideoIcon } from "lucide-react";

function getFileType(name) {
    if (/\.(jpe?g|png|gif|svg|webp)$/i.test(name)) return "image";
    if (/\.(mp4|avi|mov|webm)$/i.test(name)) return "video";
    if (/\.(pdf|docx?|xlsx?|pptx?)$/i.test(name)) return "file";
    return "link";
}

export default function ContentItem({ content, isTeacher, onEdit, onDelete }) {
    return (
        <div className="bg-slate-50 p-4 rounded-xl shadow flex flex-col relative">
            <div className="flex gap-2 items-center mb-1">
                <span className="font-bold text-orange-500 text-lg">{content.title}</span>
                {isTeacher && (
                    <div className="ml-auto flex gap-1">
                        <button title="تعديل" onClick={onEdit}>
                            <span className="sr-only">تعديل</span>✏️
                        </button>
                        <button title="حذف" onClick={onDelete}>
                            <span className="sr-only">حذف</span>🗑️
                        </button>
                    </div>
                )}
            </div>
            {/* المحتوى نصي */}
            {(!content.files || content.files.length === 0) && (
                <div className="text-gray-700 mb-2 whitespace-pre-line">{content.body}</div>
            )}

            {/* المحتوى مرفق */}
            {content.files && content.files.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-2">
                    {content.files.map((file, i) => {
                        const fileType = getFileType(file.name);
                        if (fileType === "image")
                            return (
                                <a key={i} href={file.url} target="_blank" rel="noopener noreferrer"
                                    className="flex flex-col items-center group"
                                    style={{ width: "110px" }}>
                                    <img
                                        src={file.url}
                                        alt={file.name}
                                        className="w-24 h-24 rounded-lg object-cover border shadow group-hover:scale-105 transition"
                                    />
                                    <div className="text-xs text-center mt-1">{file.name}</div>
                                </a>
                            );
                        if (fileType === "video")
                            return (
                                <div key={i} className="flex flex-col items-center" style={{ width: "180px" }}>
                                    <video
                                        src={file.url}
                                        controls
                                        className="rounded-xl w-40 h-28 border shadow"
                                        poster={file.poster || undefined}
                                    />
                                    <div className="text-xs text-center mt-1">{file.name}</div>
                                </div>
                            );
                        // ملفات قابلة للتنزيل
                        return (
                            <a
                                key={i}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-2 bg-slate-100 rounded shadow hover:bg-orange-50"
                                download
                            >
                                <File className="inline" size={18} />
                                <span className="text-xs">{file.name}</span>
                                <Download size={16} />
                            </a>
                        );
                    })}
                </div>
            )}

            {content.body && content.files && content.files.length > 0 && (
                <div className="text-gray-700 mt-2 whitespace-pre-line">{content.body}</div>
            )}
        </div>
    );
}
