// src/pages/Course/components/SectionContentTab.jsx
import { useState } from "react";
import Button from "../../../../components/ui/Button";
import ContentFormModal from "../ContentFormModal";
import DeleteConfirmation from "../../../../components/ui/DeleteConfirmation";
import { BookOpen, Edit2, Trash2, File } from "lucide-react";
import { useCourseContent } from "../../../../contexts/CourseContentContext";


export default function SectionContentTab({
  sectionId,
  contents = [],
  isTeacher,
  onRefresh,
}) {
  const { deleteContent } = useCourseContent();
  const [showForm, setShowForm] = useState(false);
  const [editContent, setEditContent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // حذف الدرس
  async function handleDeleteContent(content) {
    await deleteContent(content.id, sectionId);
    setDeleteTarget(null);
    if (onRefresh) onRefresh();
  }

  return (
    <div>
      {/* زر إضافة درس للمعلم */}
      {isTeacher && (
        <Button
          className="mb-4 bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => {
            setEditContent(null);
            setShowForm(true);
          }}
        >
          + إضافة درس جديد
        </Button>
      )}

      {/* قائمة الدروس */}
      {contents.length === 0 ? (
        <div className="text-gray-400 text-center py-10">
          <BookOpen size={36} className="mx-auto mb-2" />
          لا يوجد دروس مضافة في هذا القسم بعد.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {contents.map((content) => (
            <div
              key={content.id}
              className="bg-white border border-orange-100 rounded-xl shadow p-4 flex flex-col md:flex-row gap-4 items-start hover:shadow-lg transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <File size={18} className="text-orange-400" />
                  <span className="font-bold text-blue-950 text-lg">{content.title}</span>
                </div>
                <div className="text-slate-700 text-sm mb-2 line-clamp-2">
                  {content.body || "لا يوجد وصف"}
                </div>
                {content.files && content.files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {content.files.map((file, i) => (
                      <a
                        key={i}
                        href={file.url || file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-orange-50 border border-orange-200 text-orange-600 px-2 py-1 rounded-lg text-xs hover:bg-orange-100 transition"
                      >
                        تحميل مرفق 
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* أزرار إدارة للمعلم */}
              {isTeacher && (
                <div className="flex flex-row gap-2 min-w-[100px]">
                  <button
                    onClick={() => {
                      setEditContent(content);
                      setShowForm(true);
                    }}
                    className="flex items-center gap-1 bg-sky-100 text-sky-900 hover:bg-sky-200 font-bold rounded-xl px-3 py-2"
                  >
                    <Edit2 size={15} /> تعديل
                  </button>
                  <button
                    onClick={() => setDeleteTarget(content)}
                    className="flex items-center gap-1 bg-red-100 text-red-800 hover:bg-red-200 font-bold rounded-xl px-3 py-2"
                  >
                    <Trash2 size={15} /> حذف
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* مودال إضافة أو تعديل درس */}
      {showForm && (
        <ContentFormModal
          content={editContent}
          sectionId={sectionId}
          onClose={() => setShowForm(false)}
          onSaved={onRefresh}
        />
      )}

      {/* مودال تأكيد حذف */}
      {deleteTarget && (
        <DeleteConfirmation
          title="حذف الدرس"
          message="هل أنت متأكد أنك تريد حذف هذا الدرس؟ لا يمكن التراجع!"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDeleteContent(deleteTarget)}
        />
      )}
    </div>
  );
}
