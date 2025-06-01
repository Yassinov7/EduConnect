import { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "../services/supabaseClient";
import { toast } from "sonner";

// استخراج اسم الملف من الـ public url
function getStorageFileName(fileUrl) {
  const parts = fileUrl.split("/");
  return parts[parts.length - 1];
}

// حذف مجموعة ملفات من الباكت
async function removeFilesFromBucket(files = []) {
  if (!files.length) return;
  const fileNames = files.map(file => getStorageFileName(file.url));
  const { error } = await supabase.storage.from("content-files").remove(fileNames);
  if (error) toast.error("تعذر حذف بعض الملفات من التخزين!");
}

// 1. إنشاء السياق
const CourseContentContext = createContext();

// 2. المزود الرئيسي
export function CourseContentProvider({ children }) {
  // الأقسام لكل كورس: { [courseId]: [sections] }
  const [sectionsMap, setSectionsMap] = useState({});
  // الاختبارات لكل قسم: { [sectionId]: [quizzes] }
  const [quizzesMap, setQuizzesMap] = useState({});
  // محتوى الدروس لكل قسم: { [sectionId]: [contents] }
  const [contentsMap, setContentsMap] = useState({});
  // حالة التحميل العامة
  const [loading, setLoading] = useState(false);

  // ----------- الأقسام (Sections) -------------
  const fetchSections = useCallback(async (courseId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sections")
      .select("*")
      .eq("course_id", courseId)
      .order("id", { ascending: true });

    setLoading(false);
    if (error) {
      toast.error("تعذر جلب الأقسام!");
      setSectionsMap((prev) => ({ ...prev, [courseId]: [] }));
      return [];
    }
    setSectionsMap((prev) => ({ ...prev, [courseId]: data || [] }));
    return data || [];
  }, []);

  const addSection = async (courseId, title) => {
    setLoading(true);
    const { error } = await supabase
      .from("sections")
      .insert([{ course_id: courseId, title }]);
    setLoading(false);
    if (!error) {
      await fetchSections(courseId);
      return true;
    }
    return false;
  };

  const updateSection = async (sectionId, courseId, title) => {
    setLoading(true);
    const { error } = await supabase
      .from("sections")
      .update({ title })
      .eq("id", sectionId);
    setLoading(false);
    if (!error) {
      await fetchSections(courseId);
      return true;
    }
    return false;
  };

  // حذف قسم مع حذف كل محتوياته (وملفاتها من الباكت)
  const deleteSection = async (sectionId, courseId) => {
    setLoading(true);
    // جلب جميع المحتويات المرتبطة بالقسم (للحذف مع ملفاتها)
    const { data: contents } = await supabase
      .from("contents")
      .select("id, files")
      .eq("section_id", sectionId);

    // حذف كل الملفات المرفقة للمحتويات
    for (const content of contents || []) {
      if (content.files?.length) {
        await removeFilesFromBucket(content.files);
      }
    }

    // حذف المحتويات نفسها
    await supabase.from("contents").delete().eq("section_id", sectionId);

    // حذف القسم نفسه
    const { error } = await supabase
      .from("sections")
      .delete()
      .eq("id", sectionId);

    setLoading(false);
    if (!error) {
      await fetchSections(courseId);
      await fetchContents(sectionId); // لتحديث القائمة الفورية
      return true;
    }
    return false;
  };

  // ----------- الاختبارات (Quizzes) -------------
  const fetchQuizzes = useCallback(async (sectionId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("section_id", sectionId)
      .order("id", { ascending: true });

    setLoading(false);
    if (error) {
      toast.error("تعذر جلب الاختبارات!");
      setQuizzesMap((prev) => ({ ...prev, [sectionId]: [] }));
      return [];
    }
    setQuizzesMap((prev) => ({ ...prev, [sectionId]: data || [] }));
    return data || [];
  }, []);

  const addQuiz = async (sectionId, title) => {
    setLoading(true);
    const { error } = await supabase
      .from("quizzes")
      .insert([{ section_id: sectionId, title }]);
    setLoading(false);
    if (!error) {
      await fetchQuizzes(sectionId);
      return true;
    }
    return false;
  };

  const updateQuiz = async (quizId, sectionId, title) => {
    setLoading(true);
    const { error } = await supabase
      .from("quizzes")
      .update({ title })
      .eq("id", quizId);
    setLoading(false);
    if (!error) {
      await fetchQuizzes(sectionId);
      return true;
    }
    return false;
  };

  const deleteQuiz = async (quizId, sectionId) => {
    setLoading(true);
    const { error } = await supabase
      .from("quizzes")
      .delete()
      .eq("id", quizId);
    setLoading(false);
    if (!error) {
      await fetchQuizzes(sectionId);
      return true;
    }
    return false;
  };

  // ----------- محتوى الدروس (Contents) -------------
  const fetchContents = useCallback(async (sectionId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contents")
      .select("*")
      .eq("section_id", sectionId)
      .order("id", { ascending: true });

    setLoading(false);
    if (error) {
      toast.error("تعذر جلب محتوى الدروس!");
      setContentsMap((prev) => ({ ...prev, [sectionId]: [] }));
      return [];
    }
    setContentsMap((prev) => ({ ...prev, [sectionId]: data || [] }));
    return data || [];
  }, []);

  const addContent = async (sectionId, title, body, files = []) => {
    setLoading(true);
    const { error } = await supabase
      .from("contents")
      .insert([{ section_id: sectionId, title, body, files }]);
    setLoading(false);
    if (!error) {
      await fetchContents(sectionId);
      return true;
    }
    return false;
  };

  const updateContent = async (contentId, sectionId, title, body, files = []) => {
    setLoading(true);
    const { error } = await supabase
      .from("contents")
      .update({ title, body, files })
      .eq("id", contentId);
    setLoading(false);
    if (!error) {
      await fetchContents(sectionId);
      return true;
    }
    return false;
  };

  // حذف محتوى مع حذف ملفاته من الباكت
  const deleteContent = async (contentId, sectionId) => {
    setLoading(true);
    // جلب الملفات لهذا المحتوى
    const { data: content } = await supabase
      .from("contents")
      .select("files")
      .eq("id", contentId)
      .single();

    if (content?.files?.length) {
      await removeFilesFromBucket(content.files);
    }
    const { error } = await supabase
      .from("contents")
      .delete()
      .eq("id", contentId);
    setLoading(false);
    if (!error) {
      await fetchContents(sectionId);
      return true;
    }
    return false;
  };

  // 3. قيمة السياق (value)
  const contextValue = {
    // أقسام
    sectionsMap, fetchSections, addSection, updateSection, deleteSection,
    // اختبارات
    quizzesMap, fetchQuizzes, addQuiz, updateQuiz, deleteQuiz,
    // محتوى
    contentsMap, fetchContents, addContent, updateContent, deleteContent,
    // حالة عامة
    loading,
  };

  return (
    <CourseContentContext.Provider value={contextValue}>
      {children}
    </CourseContentContext.Provider>
  );
}

// 4. هوك جاهز للاستدعاء في أي مكون
export function useCourseContent() {
  return useContext(CourseContentContext);
}
