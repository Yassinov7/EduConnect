import { useEffect, useState } from "react";
import { useCourseContent } from "../../../../contexts/CourseContentContext";
import AssignmentCard from "./AssignmentCard";
import AssignmentFormModal from "./AssignmentFormModal"; // سنبنيه بعد قليل
import DeleteConfirmation from "../../../../components/ui/DeleteConfirmation";
import Button from "../../../../components/ui/Button";
import AssignmentSubmissionsList from "./AssignmentSubmissionsList";
export default function SectionAssignmentsTab({ sectionId, isTeacher, onRefresh }) {
  const { assignmentsMap, fetchAssignments, deleteAssignment } = useCourseContent();
  const [showForm, setShowForm] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showSubsAssignmentId, setShowSubsAssignmentId] = useState(null);
  
  useEffect(() => {
    fetchAssignments(sectionId);
  }, [sectionId, fetchAssignments]);

  const assignments = assignmentsMap[sectionId] || [];

  async function handleDelete(assignment) {
    await deleteAssignment(assignment.id, sectionId);
    setDeleteTarget(null);
    if (onRefresh) onRefresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {assignments.length === 0 && (
        <div className="text-gray-400 text-center">لا توجد تكليفات بعد في هذا القسم.</div>
      )}
      {assignments.map(a => (
        <AssignmentCard
          key={a.id}
          assignment={a}
          isTeacher={isTeacher}
          onShowSubmissions={() => setShowSubsAssignmentId(a.id)}
          onEdit={() => { setEditAssignment(a); setShowForm(true); }}
          onDelete={() => setDeleteTarget(a)}
        />
      ))}
      {/* زر إضافة تكليف جديد إذا كان Teacher */}
      {isTeacher && (
        <Button
          className="mt-4 w-max self-center bg-orange-600 hover:bg-orange-700"
          onClick={() => {
            setEditAssignment(null);
            setShowForm(true);
          }}
        >
          إضافة تكليف جديد
        </Button>
      )}
      {/* نافذة إضافة/تعديل تكليف */}
      {showForm && (
        <AssignmentFormModal
          assignment={editAssignment}
          sectionId={sectionId}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            fetchAssignments(sectionId);
            if (onRefresh) onRefresh();
          }}
        />
      )}
      {/* مودال عرض التسليمات */}
      {showSubsAssignmentId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg relative max-w-lg w-full">
            <button className="absolute left-4 top-4 text-red-500 font-bold" onClick={() => setShowSubsAssignmentId(null)}>
              إغلاق ✕
            </button>
            <AssignmentSubmissionsList assignmentId={showSubsAssignmentId} />
          </div>
        </div>
      )}
      {/* نافذة تأكيد الحذف */}
      {deleteTarget && (
        <DeleteConfirmation
          title="حذف التكليف"
          message="هل أنت متأكد أنك تريد حذف هذا التكليف؟ لا يمكن التراجع."
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}
    </div>
  );
}
