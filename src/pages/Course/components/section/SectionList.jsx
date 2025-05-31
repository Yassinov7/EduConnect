// components/section/SectionList.jsx
import Button from "../../../../components/ui/Button";
import { Edit, Trash2, PlusCircle } from "lucide-react";

export default function SectionList({
    sections,
    activeSection,
    setActiveSection,
    setActiveTab,
    isTeacher,
    onEdit,
    onDelete,
    onAdd,
}) {
    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {sections.map((section) => (
                <div key={section.id} className="relative">
                    <button
                        onClick={() => {
                            setActiveSection(section.id);
                            setActiveTab("contents");
                        }}
                        className={`px-4 py-2 rounded-xl font-bold shadow transition
                ${section.id === activeSection
                                ? "bg-orange-500 text-white"
                                : "bg-gray-100 text-slate-900 hover:bg-orange-100"
                            }
              `}
                    >
                        {section.title}
                    </button>
                    {isTeacher && (
                        <div className="absolute -top-2 -right-2 flex gap-1">
                            <button title="تعديل القسم" onClick={() => onEdit(section)}>
                                <Edit size={16} className="text-blue-950 hover:text-orange-500" />
                            </button>
                            <button title="حذف القسم" onClick={() => onDelete(section)}>
                                <Trash2 size={16} className="text-red-500 hover:text-red-700" />
                            </button>
                        </div>
                    )}
                </div>
            ))}
            {isTeacher && (
                <Button className="ml-2 bg-blue-950 hover:bg-blue-900" onClick={onAdd}>
                    <PlusCircle /> إضافة قسم جديد
                </Button>
            )}
        </div>
    );
}
