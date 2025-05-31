import { useRef, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { toast } from "sonner";
import { UserCircle, Camera } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// استخراج فقط اسم الملف من رابط supabase (يعمل مع أي رابط supabase public bucket)
function getStoragePathFromUrl(url) {
  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1].split("?")[0];
    return filename;
  } catch {
    return null;
  }
}

export default function AvatarUpload({ userId, avatarUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
      // حذف الصورة القديمة (لو موجودة)
      if (avatarUrl) {
        const oldPath = getStoragePathFromUrl(avatarUrl);
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      // اسم جديد وفريد
      const fileExt = file.name.split(".").pop();
      const newFileName = `${userId}-${uuidv4()}.${fileExt}`;
      const filePath = `${newFileName}`;

      // رفع الصورة
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        toast.error("فشل رفع الصورة: " + uploadError.message);
        setUploading(false);
        return;
      }

      // جلب رابط الصورة العام
      const { data: publicData, error: urlError } = supabase
        .storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (urlError || !publicData?.publicUrl) {
        toast.error("تعذر جلب رابط الصورة");
        setUploading(false);
        return;
      }

      // تحديث رابط الصورة في بروفايل المستخدم
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicData.publicUrl })
        .eq("user_id", userId);

      if (dbError) {
        toast.error("حدث خطأ عند تحديث بيانات المستخدم");
        setUploading(false);
        return;
      }

      setUploading(false);
      toast.success("تم تحديث الصورة بنجاح");
      if (onUploaded) onUploaded(publicData.publicUrl);

    } catch (err) {
      setUploading(false);
      toast.error("حدث خطأ تقني: " + err.message);
    }
  }

  return (
    <div className="relative w-28 h-28 flex items-center justify-center mb-2">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="الصورة الشخصية"
          className="w-28 h-28 rounded-full object-cover border border-orange-300 shadow"
        />
      ) : (
        <UserCircle size={110} className="text-slate-300" />
      )}

      <button
        type="button"
        onClick={() => inputRef.current.click()}
        className="absolute bottom-1 left-1 bg-orange-500 text-white rounded-full p-2 shadow hover:bg-orange-600 transition"
        aria-label="تغيير الصورة الشخصية"
        disabled={uploading}
      >
        <Camera size={20} />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />
    </div>
  );
}
