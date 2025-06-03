// components/section/SectionContentList.jsx
import ContentItem from "./ContentItem";
import Button from "../../../../components/ui/Button";
import { PlusCircle } from "lucide-react";

export default function SectionContentList({
    contents,
    isTeacher,
    onAdd,
    onEdit,
    onDelete,
}) {
    return (
        <div>
            <div className="flex flex-col gap-4">
                {contents.length === 0 && (
                    <div className="text-gray-500">لا يوجد محتوى بعد في هذا القسم.</div>
                )}
                {contents.map((content) => (
                    <ContentItem
                        key={content.id}
                        content={content}
                        isTeacher={isTeacher}
                        onEdit={() => onEdit(content)}
                        onDelete={() => onDelete(content)}
                    />
                ))}
            </div>
            {isTeacher && (
                <Button className="mt-4" onClick={onAdd}>
                    <PlusCircle /> إضافة محتوى جديد
                </Button>
            )}
        </div>
    );
}
