// src/pages/Course/components/AssignmentSubmissionsList.jsx
import { useCourseContent } from "../../../../contexts/CourseContentContext";
import Button from "../../../../components/ui/Button";
import { useEffect } from "react";
import { useProgress } from "../../../../contexts/ProgressContext";

export default function AssignmentSubmissionsList({ assignmentId }) {
  const { submissionsMap, fetchSubmissions, updateSubmissionStatus } = useCourseContent();
  const { markAssignmentDone } = useProgress();

  useEffect(() => {
    fetchSubmissions(assignmentId);
  }, [assignmentId, fetchSubmissions]);

  const submissions = (submissionsMap[assignmentId] || []).map(sub => ({
    ...sub,
    section_id: sub.assignments?.section_id,
    course_id: sub.assignments?.sections?.course_id,
  }));


  // دالة قبول التسليم + تسجيل التقدم
  async function handleApprove(sub) {
  console.log("تمت الموافقة على:", sub);
  await updateSubmissionStatus(sub.id, assignmentId, "approved");
  if (sub.user_id && sub.assignment_id && sub.section_id && sub.course_id) {
    await markAssignmentDone(
      sub.user_id,
      sub.course_id,
      sub.section_id,
      sub.assignment_id
    );
  } else {
    console.error("نقص معرفات في التسليم", sub);
  }
}

  if (!submissions.length)
    return <div className="text-gray-400 text-center py-4">لا توجد تسليمات بعد.</div>;

  return (
    <div className="flex flex-col gap-4">
      {submissions.map(sub => (
        <div
          key={sub.id}
          className="bg-orange-50 border-l-4 border-orange-400 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow"
        >
          {/* بيانات الطالب */}
          <div className="flex items-center gap-3 flex-1">
            <img
              src={sub.profiles?.avatar_url || "https://placehold.co/40x40"}
              alt="avatar"
              className="w-10 h-10 rounded-full border"
            />
            <div>
              <div className="font-bold text-orange-900">
                {sub.profiles?.full_name || "طالب غير معروف"}
              </div>
              <a
                href={sub.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline text-sm"
              >
                ملف التسليم
              </a>
              <div className="mt-1 text-xs text-gray-500">
                {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : ""}
              </div>
            </div>
          </div>
          {/* حالة التسليم + الأزرار */}
          <div className="flex flex-col items-start gap-2 min-w-max">
            <span
              className={
                "font-bold px-2 py-1 rounded-lg " +
                (sub.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : sub.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-orange-100 text-orange-700")
              }
            >
              {sub.status === "approved"
                ? "مقبول"
                : sub.status === "rejected"
                  ? "مرفوض"
                  : "بانتظار"}
            </span>
            <div className="flex gap-1 mt-1">
              <Button
                size="sm"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => handleApprove(sub)}
              >
                قبول
              </Button>
              <Button
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => updateSubmissionStatus(sub.id, assignmentId, "rejected")}
              >
                رفض
              </Button>
              <Button
                size="sm"
                className="bg-orange-500 text-white hover:bg-orange-600"
                onClick={() => updateSubmissionStatus(sub.id, assignmentId, "pending")}
              >
                إعادة للمراجعة
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
