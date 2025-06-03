// src/pages/Course/components/AssignmentFormModal.jsx
import { useState } from "react";
import { useCourseContent } from "../../../../contexts/CourseContentContext";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";

export default function AssignmentFormModal({ assignment, sectionId, onClose, onSaved }) {
    const { addAssignment, updateAssignment } = useCourseContent();
    const [title, setTitle] = useState(assignment?.title || "");
    const [description, setDescription] = useState(assignment?.description || "");
    const [dueDate, setDueDate] = useState(assignment?.due_date?.slice(0, 10) || "");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        if (assignment) {
            await updateAssignment(assignment.id, sectionId, {
                title,
                description,
                due_date: dueDate || null
            });
        } else {
            await addAssignment(sectionId, title, description, dueDate || null);
        }
        setLoading(false);
        onSaved?.();
    }

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-xl shadow-xl flex flex-col gap-3 w-full max-w-md"
            >
                <div className="text-xl font-bold text-orange-600 mb-2">
                    {assignment ? "تعديل التكليف" : "إضافة تكليف جديد"}
                </div>
                <Input
                    label="عنوان التكليف"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
                <Input
                    label="وصف التكليف"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    as="textarea"
                />
                <Input
                    label="تاريخ التسليم (اختياري)"
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                    <Button
                        type="submit"
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={loading}
                    >
                        {assignment ? "حفظ التغييرات" : "إضافة"}
                    </Button>
                    <Button
                        type="button"
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                        onClick={onClose}
                        disabled={loading}
                    >
                        إلغاء
                    </Button>
                </div>
            </form>
        </div>
    );
}
