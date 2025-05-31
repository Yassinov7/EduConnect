import { useState } from "react";
import { useGlobalData } from "../../contexts/GlobalDataProvider";
import { supabase } from "../../services/supabaseClient";
import { toast } from "sonner";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import ConfirmDeleteDialog from "../../components/ui/ConfirmDeleteDialog";
import Button from "../../components/ui/Button";

export default function CategoriesPage() {
  const { categories, categoriesLoading, fetchCategories } = useGlobalData();
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
      toast.error("يرجى إدخال اسم التصنيف");
      setFormLoading(false);
      return;
    }

    if (editCategory) {
      // تعديل
      const { error } = await supabase
        .from("categories")
        .update({ name: formName.trim(), description: formDesc.trim() })
        .eq("id", editCategory.id);
      if (error) toast.error(error.message);
      else toast.success("تم تحديث التصنيف");
    } else {
      // إضافة
      const { error } = await supabase
        .from("categories")
        .insert([{ name: formName.trim(), description: formDesc.trim() }]);
      if (error) toast.error(error.message);
      else toast.success("تم إضافة التصنيف");
    }
    setFormLoading(false);
    setShowForm(false);
    setEditCategory(null);
    setFormName("");
    setFormDesc("");
    fetchCategories();
  }

  // تأكيد الحذف
  async function handleDelete() {
    if (!deleteCat) return;
    setDeleteLoading(true);
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", deleteCat.id);
    setDeleteLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("تم حذف التصنيف");
      fetchCategories();
    }
    setDeleteCat(null);
  }

  return (
    <div className="min-h-screen bg-slate-100 pt-24 flex flex-col items-center px-2">
      <div className="bg-white rounded-2xl shadow-xl p-7 w-full max-w-3xl flex flex-col gap-6">
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

        {/* قائمة التصنيفات */}
        <div className="mt-3">
          {categoriesLoading ? (
            <div className="text-center text-slate-500 py-6">...تحميل التصنيفات</div>
          ) : categories.length === 0 ? (
            <div className="text-center text-slate-400 py-6">لا يوجد تصنيفات حالياً</div>
          ) : (
            <table className="w-full mt-1 bg-white rounded-xl shadow border">
              <thead>
                <tr className="bg-orange-50">
                  <th className="py-2 px-4 text-right font-bold text-slate-800">#</th>
                  <th className="py-2 px-4 text-right font-bold text-slate-800">الاسم</th>
                  <th className="py-2 px-4 text-right font-bold text-slate-800">الوصف</th>
                  <th className="py-2 px-4 text-right font-bold text-slate-800">عدد الدورات</th>
                  <th className="py-2 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr key={cat.id} className="border-t">
                    <td className="py-2 px-4 text-center">{i + 1}</td>
                    <td className="py-2 px-4">{cat.name}</td>
                    <td className="py-2 px-4">{cat.description || <span className="text-gray-400">بدون وصف</span>}</td>
                    <td className="py-2 px-4 text-center">{cat.courses_count}</td>
                    <td className="py-2 px-4 flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        className="flex items-center gap-1 text-blue-700 hover:text-white hover:bg-blue-700 px-3"
                        onClick={() => openForm(cat)}
                      >
                        <Edit size={18} /> تعديل
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center gap-1 text-red-600 hover:text-white hover:bg-red-600 px-3"
                        onClick={() => setDeleteCat(cat)}
                      >
                        <Trash2 size={18} /> حذف
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
