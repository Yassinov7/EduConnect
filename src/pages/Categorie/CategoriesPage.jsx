import { useState } from "react";
import { useGlobalData } from "../../contexts/GlobalDataProvider";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import ConfirmDeleteDialog from "../../components/ui/ConfirmDeleteDialog";
import Button from "../../components/ui/Button";

export default function CategoriesPage() {
  const {
    categories,
    categoriesLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    fetchCategories,
  } = useGlobalData();

  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteCat, setDeleteCat] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // القيم الأولية للفورم
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // عند فتح الفورم (لإنشاء أو تعديل)
  function openForm(category = null) {
    setShowForm(true);
    setEditCategory(category);
    setFormName(category?.name || "");
    setFormDesc(category?.description || "");
  }

  // حفظ/تعديل التصنيف
  async function handleSubmit(e) {
    e.preventDefault();
    setFormLoading(true);

    if (!formName.trim()) {
      setFormLoading(false);
      return;
    }

    let ok = false;
    if (editCategory) {
      ok = await updateCategory(editCategory.id, {
        name: formName.trim(),
        description: formDesc.trim(),
      });
    } else {
      ok = await addCategory({
        name: formName.trim(),
        description: formDesc.trim(),
      });
    }

    setFormLoading(false);

    if (ok) {
      setShowForm(false);
      setEditCategory(null);
      setFormName("");
      setFormDesc("");
    }
  }

  // تأكيد الحذف
  async function handleDelete() {
    if (!deleteCat) return;
    setDeleteLoading(true);
    const ok = await deleteCategory(deleteCat.id);
    setDeleteLoading(false);
    if (ok) setDeleteCat(null);
  }

  return (
    <div className="min-h-screen bg-slate-100 pt-24 flex flex-col items-center px-2">
      <div className="bg-white rounded-2xl shadow-xl p-7 w-full max-w-3xl flex flex-col gap-6">
        {/* العنوان وزر الإضافة */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-2xl font-bold text-orange-600">إدارة التصنيفات</h2>
          <Button
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl shadow transition"
            onClick={() => openForm()}
          >
            <PlusCircle size={20} /> إضافة تصنيف جديد
          </Button>
        </div>

        {/* فورم إضافة/تعديل التصنيف */}
        {showForm && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-orange-50 rounded-xl p-5 shadow-inner">
            <div className="font-bold text-slate-900">{editCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد"}</div>
            <input
              type="text"
              placeholder="اسم التصنيف"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full focus:border-orange-400"
              required
            />
            <textarea
              placeholder="وصف التصنيف (اختياري)"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full min-h-[60px] focus:border-orange-400"
            />
            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={formLoading}>
                {formLoading ? "جارٍ الحفظ..." : (editCategory ? "حفظ التعديل" : "إضافة")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowForm(false);
                  setEditCategory(null);
                  setFormName("");
                  setFormDesc("");
                }}
                disabled={formLoading}
              >
                إلغاء
              </Button>
            </div>
          </form>
        )}

        {/* قائمة التصنيفات بشكل بطاقات */}
        <div className="mt-3 w-full">
          {categoriesLoading ? (
            <div className="text-center text-slate-500 py-6">...تحميل التصنيفات</div>
          ) : categories.length === 0 ? (
            <div className="text-center text-slate-400 py-6">لا يوجد تصنيفات حالياً</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {categories.map((cat, i) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col gap-2 border border-slate-100 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-orange-600 text-lg truncate" title={cat.name}>{cat.name}</span>
                    <span className="text-xs text-slate-400">#{i + 1}</span>
                  </div>
                  <div className="text-sm text-slate-700 min-h-[32px]">
                    {cat.description || <span className="text-gray-400">بدون وصف</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-orange-50 px-2 py-1 rounded text-orange-600 text-xs">
                      {cat.courses_count} دورة
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center gap-1 text-blue-700 hover:text-white hover:bg-blue-700 px-2 py-1 text-xs"
                      onClick={() => openForm(cat)}
                    >
                      <Edit size={16} /> تعديل
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center gap-1 text-red-600 hover:text-white hover:bg-red-600 px-2 py-1 text-xs"
                      onClick={() => setDeleteCat(cat)}
                    >
                      <Trash2 size={16} /> حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* مودال تأكيد الحذف */}
      <ConfirmDeleteDialog
        open={!!deleteCat}
        loading={deleteLoading}
        message={deleteCat ? `سيتم حذف التصنيف "${deleteCat.name}" وجميع الدورات المرتبطة به. هل أنت متأكد؟` : ""}
        onCancel={() => setDeleteCat(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
