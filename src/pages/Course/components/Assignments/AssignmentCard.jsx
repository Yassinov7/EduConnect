// src/pages/Course/components/AssignmentCard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../../../contexts/AuthProvider";
import { useCourseContent } from "../../../../contexts/CourseContentContext";

export default function AssignmentCard({ assignment, isTeacher, onShowSubmissions, onEdit, onDelete }) {
  const { user } = useAuth();
  const { submissionsMap, uploadSubmission, fetchSubmissions } = useCourseContent();

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isTeacher && assignment?.id) {
      fetchSubmissions(assignment.id);
    }
  }, [assignment?.id, isTeacher, fetchSubmissions]);

  const submission = !isTeacher
    ? (submissionsMap[assignment.id]?.find(s => s.user_id === user?.id) || null)
    : null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    await uploadSubmission({
      assignmentId: assignment.id,
      userId: user.id,
      file,
    });
    setUploading(false);
    await fetchSubmissions(assignment.id);
  };

  return (
    <div className={`rounded-xl p-4 shadow border-l-4 flex flex-col gap-2 ${isTeacher ? "bg-orange-50 border-orange-400" : "bg-white border-orange-400"}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <div className="flex-1">
          <div className="font-bold text-lg text-orange-600">{assignment.title}</div>
          <div className="text-gray-700 mt-1">{assignment.description}</div>
          <div className="text-sm text-slate-600 mt-1">
            آخر موعد: <b>{(assignment.due_date?.slice(0, 10)) || "غير محدد"}</b>
          </div>
        </div>

        {isTeacher && (
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
            <button className="bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1 w-full sm:w-auto" onClick={onShowSubmissions}>عرض</button>
            <button className="bg-green-600 hover:bg-green-500 text-white rounded px-3 py-1 w-full sm:w-auto" onClick={onEdit}>تعديل</button>
            <button className="bg-red-600 hover:bg-red-500 text-white rounded px-3 py-1 w-full sm:w-auto" onClick={onDelete}>حذف</button>
          </div>
        )}
      </div>

      {!isTeacher && (
        submission ? (
          <div className="flex flex-col gap-2 mt-3">
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
          <div className="mt-3">
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full sm:w-auto"
              disabled={uploading}
            />
            {uploading && <p className="text-orange-600 mt-2">جاري رفع الملف...</p>}
          </div>
        )
      )}
    </div>
  );
}
