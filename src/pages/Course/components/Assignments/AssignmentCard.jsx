// src/pages/Course/components/AssignmentCard.jsx
import { useAuth } from "../../../../contexts/AuthProvider";
import { useCourseContent } from "../../../../contexts/CourseContentContext";
import Button from "../../../../components/ui/Button";
import { useState } from "react";

export default function AssignmentCard({ assignment, isTeacher, onShowSubmissions, onEdit, onDelete }) {
  const { user } = useAuth();
  const { submissionsMap, uploadSubmission, fetchSubmissions, updateSubmissionStatus } = useCourseContent();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // إذا كان طالب: نبحث عن تسليمه الحالي
  const submission = !isTeacher
    ? (submissionsMap[assignment.id]?.find(s => s.user_id === user?.id) || null)
    : null;
    
  // رفع تسليم الطالب
  const handleUpload = async () => {
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

  // إذا معلم: زر عرض التسليمات
  if (isTeacher) {
    return (
      <div className="bg-orange-50 border-l-4 border-orange-400 rounded-xl p-4 shadow flex flex-col gap-2">
        <div className="flex  flex-col justify-between gap-2">
          <div>
            <div className="font-bold text-lg text-orange-600">{assignment.title}</div>
            <div className="text-gray-700">{assignment.description}</div>
            <div className="text-sm text-slate-600 mt-1">آخر موعد: <b>{(assignment.due_date?.slice(0, 10)) || "غير محدد" } </b></div>
          </div>
          {isTeacher && (
            <div className="flex flex-row items-center gap-2 mt-3">
              <Button className="!bg-blue-600 hover:!bg-blue-500" onClick={onShowSubmissions}>عرض </Button>
              <Button className="!bg-green-600 hover:!bg-green-500" onClick={onEdit}>تعديل</Button>
              <Button className="bg-red-600 hover:!bg-red-500" onClick={onDelete}>حذف</Button>
            </div>
          )}


        </div>
      </div>
    );
  }

  // إذا طالب: عرض حالة تسليمه وزر رفع

  return (
    <div className="bg-white border-l-4 border-orange-400 rounded-xl p-4 shadow flex flex-col gap-2">
      <div className="font-bold text-lg text-orange-600">{assignment.title}</div>
      <div className="text-gray-700">{assignment.description}</div>
      <div className="text-sm text-slate-600 mt-1">آخر موعد: <b>{(assignment.due_date?.slice(0, 10)) || "غير محدد" }</b></div>
      {submission ? (
        
        <div className="flex flex-col gap-2 mt-2">
          <div>
            حالة التسليم:{" "}
            <span className={
              submission.status === "approved" ? "text-green-600 font-bold" :
                submission.status === "rejected" ? "text-red-600 font-bold" :
                  "text-orange-500 font-bold"
            }>
              {submission.status === "approved" ? "تم القبول" :
                submission.status === "rejected" ? "مرفوض" : "بانتظار المراجعة"}
            </span>
          </div>
          <div>
            <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              ملف التسليم
            </a>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-2">
          <input type="file" onChange={e => setFile(e.target.files[0])} className="block" />
          <Button onClick={handleUpload} disabled={uploading || !file}>
            {uploading ? "جاري الرفع..." : "رفع التسليم"}
          </Button>
        </div>
      )}
    </div>
  );
}
