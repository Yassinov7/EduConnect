// src/pages/Course/components/AssignmentCard.jsx
import { useAuth } from "../../../../contexts/AuthProvider";
import { useCourseContent } from "../../../../contexts/CourseContentContext";
import Button from "../../../../components/ui/Button";
import { useState, useEffect } from "react";

export default function AssignmentCard({
  assignment,
  isTeacher,
  onShowSubmissions,
  onEdit,
  onDelete,
}) {
  const { user } = useAuth();
  const { submissionsMap, uploadSubmission, fetchSubmissions } = useCourseContent();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // عند تحميل المكون: إذا كان طالب، جلب التسليمات للمهمة الحالية
  useEffect(() => {
    if (!isTeacher && assignment?.id) {
      fetchSubmissions(assignment.id);
    }
    // eslint-disable-next-line
  }, [assignment?.id, isTeacher]);

  // نبحث عن تسليم الطالب الحالي إن وجد
  const submission =
    !isTeacher && submissionsMap?.[assignment.id]
      ? submissionsMap[assignment.id].find((s) => s.user_id === user?.id) || null
      : null;

  // رفع ملف التسليم
  const handleUpload = async (e) => {
    if (e) e.preventDfault();
    if (!file) return;
    setUploading(true);
    await uploadSubmission({
      assignmentId: assignment.id,
      userId: user.id,
      file,
    });
    setUploading(false);
    setFile(null);
    await fetchSubmissions(assignment.id);
  };

  // تصميم واجهة المعلم
  if (isTeacher) {
    return (
      <div className="bg-orange-50 border-l-4 border-orange-400 rounded-2xl p-5 shadow-md flex flex-col gap-4 max-w-xl mx-auto my-3">
        <div>
          <div className="font-bold text-xl text-orange-600">{assignment.title}</div>
          <div className="text-gray-700 mt-2">{assignment.description}</div>
          <div className="text-sm text-slate-600 mt-1">
            آخر موعد: <b>{assignment.due_date?.slice(0, 10) || "غير محدد"}</b>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button className="!bg-blue-600 hover:!bg-blue-500 min-w-[90px]" onClick={onShowSubmissions}>عرض</Button>
          <Button className="!bg-green-600 hover:!bg-green-500 min-w-[90px]" onClick={onEdit}>تعديل</Button>
          <Button className="bg-red-600 hover:!bg-red-500 min-w-[90px]" onClick={onDelete}>حذف</Button>
        </div>
      </div>
    );
  }

  // تصميم واجهة الطالب
  return (
    <div className="bg-white border-l-4 border-orange-400 rounded-2xl p-5 shadow-md flex flex-col gap-4 max-w-xl mx-auto my-3">
      <div className="font-bold text-xl text-orange-600">{assignment.title}</div>
      <div className="text-gray-700 mt-1">{assignment.description}</div>
      <div className="text-sm text-slate-600 mt-1">
        آخر موعد: <b>{assignment.due_date?.slice(0, 10) || "غير محدد"}</b>
      </div>

      {submission ? (
        <div className="flex flex-col gap-3 mt-2">
          <div>
            حالة التسليم:{" "}
            <span
              className={
                submission.status === "approved"
                  ? "text-green-600 font-bold"
                  : submission.status === "rejected"
                    ? "text-red-600 font-bold"
                    : "text-orange-500 font-bold"
              }
            >
              {submission.status === "approved"
                ? "تم القبول"
                : submission.status === "rejected"
                  ? "مرفوض"
                  : "بانتظار المراجعة"}
            </span>
          </div>
          <div>
            <a
              href={submission.file_url}
              target="_blank"
              rel="noopener noreferrer" className="text-blue-600 underline"
            >
              ملف التسليم
            </a>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full sm:w-auto rounded border border-gray-300 p-1"
          />
          <Button
          type="button"
            onClick={handleUpload}
            disabled={uploading || !file}
            className="w-full sm:w-auto"
          >
            {uploading ? "جاري الرفع..." : "رفع التسليم"}
          </Button>
        </div>
      )}
    </div>
  );
}
