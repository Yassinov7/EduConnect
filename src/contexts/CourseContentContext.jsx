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
// حذف ملفات من باكت التسليمات
async function removeAssignmentFiles(files = []) {
  if (!files.length) return;
  const fileNames = files.map(file => getStorageFileName(file.url || file.file_url));
  const { error } = await supabase.storage.from("assignment-submissions").remove(fileNames);
  if (error) toast.error("تعذر حذف بعض ملفات التكليفات من التخزين!");
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
  // التكليفات لكل قسم: { [sectionId]: [assignments] }
  const [assignmentsMap, setAssignmentsMap] = useState({});
  // تسليمات التكليفات لكل تكليف: { [assignmentId]: [submissions] }
  const [submissionsMap, setSubmissionsMap] = useState({});
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
  // جلب التكليفات
  const fetchAssignments = useCallback(async (sectionId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("section_id", sectionId)
      .order("created_at", { ascending: true });
    setLoading(false);
    if (error) {
      toast.error("تعذر جلب التكليفات!");
      setAssignmentsMap(prev => ({ ...prev, [sectionId]: [] }));
      return [];
    }
    setAssignmentsMap(prev => ({ ...prev, [sectionId]: data || [] }));
    return data || [];
  }, []);

  // إضافة تكليف
  const addAssignment = async (sectionId, title, description, due_date) => {
    setLoading(true);
    const { error } = await supabase
      .from("assignments")
      .insert([{ section_id: sectionId, title, description, due_date }]);
    setLoading(false);
    if (!error) {
      await fetchAssignments(sectionId);
      return true;
    }
    return false;
  };

  // تحديث تكليف
  const updateAssignment = async (assignmentId, sectionId, updates) => {
    setLoading(true);
    const { error } = await supabase
      .from("assignments")
      .update(updates)
      .eq("id", assignmentId);
    setLoading(false);
    if (!error) {
      await fetchAssignments(sectionId);
      return true;
    }
    return false;
  };

  // حذف تكليف مع حذف كل التسليمات وملفاتها من باكت التكليفات فقط
  const deleteAssignment = async (assignmentId, sectionId) => {
    setLoading(true);
    // جلب التسليمات لحذف ملفاتها أولاً
    const { data: submissions } = await supabase
      .from("assignment_submissions")
      .select("file_url")
      .eq("assignment_id", assignmentId);
    // حذف كل الملفات المرفقة
    const files = (submissions || []).filter(sub => sub.file_url).map(sub => ({ url: sub.file_url }));
    if (files.length) await removeAssignmentFiles(files);
    // حذف التسليمات
    await supabase.from("assignment_submissions").delete().eq("assignment_id", assignmentId);
    // حذف التكليف نفسه
    const { error } = await supabase
      .from("assignments")
      .delete()
      .eq("id", assignmentId);
    setLoading(false);
    if (!error) {
      await fetchAssignments(sectionId);
      return true;
    }
    return false;
  };

  // ----------- التسليمات (Submissions) -------------

  // جلب تسليمات تكليف واحد
  const fetchSubmissions = useCallback(async (assignmentId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("assignment_submissions")
      .select(`
                *,
                assignments (
                  id,
                  section_id,
                  sections (
                    id,
                    course_id
                  )
                ),
                profiles (
                  user_id,
                  full_name,
                  avatar_url
                )
              `)
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false });
    setLoading(false);
    if (error) {

      toast.error("تعذر جلب التسليمات!");
      setSubmissionsMap(prev => ({ ...prev, [assignmentId]: [] }));
      return [];
    }
    setSubmissionsMap(prev => ({ ...prev, [assignmentId]: data || [] }));
    return data || [];
  }, []);

  // رفع تسليم طالب (مع تحميل ملف على باكت التسليمات)
  // const uploadSubmission = async ({ assignmentId, userId, file }) => {
  //   setLoading(true);
  //   const fileExt = file.name.split(".").pop();
  //   const fileName = `${assignmentId}-${userId}-${Date.now()}.${fileExt}`;
  //   const { error: uploadError } = await supabase.storage.from("assignment-submissions").upload(fileName, file);
  //   if (uploadError) {
  //     toast.error("فشل رفع الملف.");
  //     setLoading(false);
  //     return false;
  //   }
  //   const { data: urlData } = supabase.storage.from("assignment-submissions").getPublicUrl(fileName);
  //   const fileUrl = urlData.publicUrl;
  //   const { error } = await supabase.from("assignment_submissions").insert([
  //     {
  //       assignment_id: assignmentId,
  //       user_id: userId,
  //       file_url: fileUrl,
  //       submitted_at: new Date().toISOString(),
  //       status: "pending"
  //     }
  //   ]);
  //   setLoading(false);
  //   if (!error) {
  //     await fetchSubmissions(assignmentId);
  //     toast.success("تم تسليم التكليف بنجاح!");
  //     return true;
  //   }
  //   toast.error("تعذر حفظ التسليم.");
  //   return false;
  // };
  const uploadSubmission = async ({ assignmentId, userId, file }) => {
    setLoading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${assignmentId}-${userId}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("assignment-submissions").upload(fileName, file);
    if (uploadError) {
      toast.error("فشل رفع الملف.");
      setLoading(false);
      return false;
    }
    const { data: urlData } = supabase.storage.from("assignment-submissions").getPublicUrl(fileName);
    const fileUrl = urlData.publicUrl;

    const { error } = await supabase.from("assignment_submissions").insert([
      {
        assignment_id: assignmentId,
        user_id: userId,
        file_url: fileUrl,
        submitted_at: new Date().toISOString(),
        status: "pending"
      }
    ]);
    if (error) {
      console.log("خطأ أثناء إدخال السطر:", error);
      toast.error("تعذر حفظ التسليم.");
      setLoading(false);
      return false;
    }
    setLoading(false);
    await fetchSubmissions(assignmentId);
    toast.success("تم تسليم التكليف بنجاح!");
    return true;
  };

  // حذف تسليم طالب (مع حذف الملف)
  const deleteSubmission = async (submissionId, assignmentId, fileUrl) => {
    setLoading(true);
    if (fileUrl) await removeAssignmentFiles([{ url: fileUrl }]);
    const { error } = await supabase
      .from("assignment_submissions")
      .delete()
      .eq("id", submissionId);
    setLoading(false);
    if (!error) {
      await fetchSubmissions(assignmentId);
      toast.success("تم حذف التسليم.");
      return true;
    }
    toast.error("تعذر حذف التسليم.");
    return false;
  };

  // تحديث حالة التسليم (تصحيح المعلم)
  const updateSubmissionStatus = async (submissionId, assignmentId, status) => {
    setLoading(true);
    const { error } = await supabase
      .from("assignment_submissions")
      .update({ status })
      .eq("id", submissionId);
    setLoading(false);
    if (!error) {
      await fetchSubmissions(assignmentId);
      toast.success("تم تحديث حالة التسليم.");
      return true;
    }
    console.log("submissionId, assignmentId, status", submissionId, assignmentId, status);
    toast.error(" تعذر التحديث.");
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
    // التكليفات
    assignmentsMap, fetchAssignments, addAssignment, updateAssignment, deleteAssignment,
    // التسليمات
    submissionsMap, fetchSubmissions, uploadSubmission, deleteSubmission, updateSubmissionStatus,
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
