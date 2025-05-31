// src/pages/Courses/components/ContentFormModal.jsx
import { useState, useRef } from "react";
import { supabase } from "../../../services/supabaseClient";
import Button from "../../../components/ui/Button";
import { toast } from "sonner";
import { Paperclip, FileText, FileImage, FileVideo, FileArchive, FileCode, Download } from "lucide-react";

function getFileIcon(name = "") {
    const ext = name.split('.').pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) return <FileImage className="text-blue-400" />;
    if (["pdf"].includes(ext)) return <FileText className="text-red-500" />;
    if (["doc", "docx", "txt", "rtf", "odt"].includes(ext)) return <FileText className="text-gray-500" />;
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return <FileArchive className="text-yellow-600" />;
    if (["mp4", "mov", "avi", "wmv", "webm", "mkv"].includes(ext)) return <FileVideo className="text-green-700" />;
    if (["ppt", "pptx"].includes(ext)) return <FileText className="text-orange-600" />;
    if (["js", "ts", "jsx", "tsx", "py", "java", "c", "cpp", "cs", "html", "css", "json", "md"].includes(ext)) return <FileCode className="text-indigo-500" />;
    return <Paperclip />;
}

export default function ContentFormModal({ content, sectionId, onClose, onSaved }) {
    const [title, setTitle] = useState(content?.title || "");
    const [body, setBody] = useState(content?.body || "");
    const [loading, setLoading] = useState(false);

    const [files, setFiles] = useState(content?.files || []);
    const inputRef = useRef();

    // handle file upload
    async function handleFileUpload(e) {
        const filesArr = Array.from(e.target.files);
        setLoading(true);

        let uploadedFiles = [];
        for (let file of filesArr) {
            const ext = file.name.split('.').pop();
            const filename = `contentfile-${Date.now()}-${Math.random().toString(36).substr(2, 8)}.${ext}`;
            const { error } = await supabase.storage.from("content-files").upload(filename, file, {
                cacheControl: "3600",
                upsert: false,
            });
            if (error) {
                toast.error(`فشل رفع الملف: ${file.name}`);
                continue;
            }
            const { data } = supabase.storage.from("content-files").getPublicUrl(filename);
            if (data?.publicUrl) {
                uploadedFiles.push({ name: file.name, url: data.publicUrl });
            }
        }
        setFiles(prev => [...prev, ...uploadedFiles]);
        setLoading(false);
        inputRef.current.value = "";
    }

    // remove file from the list before save (does NOT delete from bucket)
    function handleRemoveFile(idx) {
        setFiles(files.filter((_, i) => i !== idx));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        if (!title.trim()) {
            toast.error("يرجى إدخال عنوان المحتوى");
            setLoading(false);
            return;
        }
        // صيغة الملفات: [{name, url}]
        if (content) {
            // تعديل
            const { error } = await supabase.from("contents")
                .update({ title, body, files })
                .eq("id", content.id);
            if (!error) {
                toast.success("تم تحديث المحتوى بنجاح");
                onSaved && onSaved();
                onClose();
            } else toast.error(error.message);
        } else {
            // إضافة
            const { error } = await supabase.from("contents")
                .insert([{ title, body, section_id: sectionId, files }]);
            if (!error) {
                toast.success("تم إضافة المحتوى!");
                onSaved && onSaved();
                onClose();
            } else toast.error(error.message);
        }
        setLoading(false);
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
            <form className="bg-white rounded-xl shadow-xl p-7 w-[95vw] max-w-md flex flex-col gap-4 animate-fade-in" onSubmit={handleSubmit}>
                <div className="text-xl font-bold text-orange-500 mb-2">{content ? "تعديل محتوى" : "إضافة محتوى"}</div>
                <input
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="عنوان المحتوى"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={loading}
                    required
                />
                <textarea
                    className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
                    placeholder="نص المحتوى..."
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    disabled={loading}
                />

                {/* رفع الملفات */}
                <div className="flex flex-col gap-1">
                    <label className="font-bold flex items-center gap-1">
                        <Paperclip size={18} className="text-slate-400" />
                        ملفات مرفقة (اختياري)
                    </label>
                    <input
                        type="file"
                        multiple
                        ref={inputRef}
                        disabled={loading}
                        onChange={handleFileUpload}
                        className="border rounded-lg px-2 py-1 bg-gray-50"
                    />
                    <div className="flex flex-col gap-2 mt-2">
                        {files.map((file, idx) => (
                            <div key={file.url} className="flex items-center gap-2 bg-gray-50 rounded p-2">
                                {getFileIcon(file.name)}
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline flex-1 truncate" title={file.name}>
                                    {file.name}
                                </a>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFile(idx)}
                                    className="text-red-500 hover:text-red-700 px-2 font-bold text-lg"
                                    title="إزالة الملف"
                                    disabled={loading}
                                >&times;</button>
                                <a href={file.url} download={file.name} className="ml-2" title="تحميل">
                                    <Download size={18} />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 mt-4">
                    <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={loading}>
                        {loading ? "جارٍ الحفظ..." : (content ? "حفظ التعديلات" : "إضافة")}
                    </Button>
                    <Button type="button" className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-900" onClick={onClose} disabled={loading}>
                        إلغاء
                    </Button>
                </div>
            </form>
        </div>
    );
}
