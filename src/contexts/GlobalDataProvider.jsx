// src/contexts/GlobalDataContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { toast } from "sonner";

const GlobalDataContext = createContext();

export function GlobalDataProvider({ children }) {
  // التصنيفات
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // الدورات
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // ======= عمليات التصنيفات =======
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*, courses: courses(id)");
    if (error) toast.error("خطأ تحميل التصنيفات");
    setCategories(
      (data || []).map((cat) => ({
        ...cat,
        courses_count: cat.courses?.length || 0,
      }))
    );
    setCategoriesLoading(false);
  };

  const addCategory = async ({ name, description }) => {
    const { error } = await supabase
      .from("categories")
      .insert([{ name, description }]);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success("تم إضافة التصنيف");
    fetchCategories();
    return true;
  };

  const updateCategory = async (id, { name, description }) => {
    const { error } = await supabase
      .from("categories")
      .update({ name, description })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success("تم تحديث التصنيف");
    fetchCategories();
    return true;
  };

  const deleteCategory = async (id) => {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success("تم حذف التصنيف");
    fetchCategories();
    return true;
  };

  // ======= عمليات الدورات =======
  const fetchCourses = async () => {
    setCoursesLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select(
        "*, categories:category_id(name), profiles:teacher_id(full_name), sections(id), course_enrollments(id), prerequisite:prerequisite_id(id, title)"
      );
    if (error) toast.error("خطأ تحميل الدورات");
    setCourses(
      (data || []).map((c) => ({
        ...c,
        category_name: c.categories?.name,
        teacher_name: c.profiles?.full_name,
        sections_count: c.sections?.length || 0,
        students_count: c.course_enrollments?.length || 0,
        prerequisite_title: c.prerequisite?.title,
      }))
    );
    setCoursesLoading(false);
  };

  const addCourse = async (payload) => {
    const { error } = await supabase.from("courses").insert([payload]);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success("تم إضافة الدورة!");
    fetchCourses();
    return true;
  };

  const updateCourse = async (id, payload) => {
    const { error } = await supabase.from("courses").update(payload).eq("id", id);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success("تم تعديل الدورة بنجاح");
    fetchCourses();
    return true;
  };

  // رفع صورة غلاف دورة
  const uploadCourseCover = async (file, userId) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `cover-${userId}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from("covers").upload(fileName, file);
    if (error) {
      toast.error("فشل رفع الغلاف");
      return null;
    }
    const { data: urlData } = supabase.storage.from("covers").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  // حذف دورة مع حذف الغلاف من التخزين إن وجد
  const deleteCourseWithCover = async (course) => {
    // حذف من جدول الدورات
    const { error } = await supabase.from("courses").delete().eq("id", course.id);
    if (!error) {
      // حذف الغلاف من التخزين إذا وجد
      if (course.cover_url) {
        try {
          const urlParts = course.cover_url.split("/");
          const fileName = urlParts[urlParts.length - 1];
          await supabase.storage.from("covers").remove([fileName]);
        } catch (e) {
          // ليس من الضروري إعلام المستخدم إذا فشل حذف الصورة
        }
      }
      toast.success("تم حذف الدورة بنجاح");
      fetchCourses();
      return true;
    } else {
      toast.error("فشل الحذف: " + error.message);
      return false;
    }
  };

  // ======= تحميل تلقائي عند بداية التطبيق =======
  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, []);

  return (
    <GlobalDataContext.Provider
      value={{
        // التصنيفات
        categories,
        categoriesLoading,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        // الدورات
        courses,
        coursesLoading,
        fetchCourses,
        addCourse,
        updateCourse,
        uploadCourseCover,
        deleteCourseWithCover,
      }}
    >
      {children}
    </GlobalDataContext.Provider>
  );
}

export function useGlobalData() {
  return useContext(GlobalDataContext);
}
