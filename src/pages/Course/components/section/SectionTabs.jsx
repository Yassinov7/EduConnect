import { useEffect, useState } from "react";
import Button from "../../../../components/ui/Button";
import SectionList from "./SectionList";
import SectionContentList from "./SectionContentList";
import SectionFormModal from "../SectionFormModal";
import ContentFormModal from "../ContentFormModal";
import QuizFormModal from "../QuizFormModal";
import DeleteConfirmation from "../../../../components/ui/DeleteConfirmation";
import { FileText, ListChecks } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthProvider";
import { useCourseContent } from "../../../../contexts/CourseContentContext";

export default function SectionTabs({ courseId, isTeacher }) {
  const {
    sectionsMap,
    fetchSections,
    addSection,
    updateSection,
    deleteSection,
    quizzesMap,
    fetchQuizzes,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    contentsMap,
    fetchContents,
    addContent,
    updateContent,
    deleteContent,
    loading
  } = useCourseContent();

  const [activeSection, setActiveSection] = useState(null);
  const [activeTab, setActiveTab] = useState("contents");
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [showContentForm, setShowContentForm] = useState(false);
  const [editContent, setEditContent] = useState(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [quizSolveStatus, setQuizSolveStatus] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();

  // جلب الأقسام عند تغيير الكورس
  useEffect(() => {
    fetchSections(courseId);
    setActiveSection(null);
    // eslint-disable-next-line
  }, [courseId]);

  // تعيين أول قسم نشط بعد الجلب
  useEffect(() => {
    const sections = sectionsMap[courseId] || [];
    if (sections.length && !activeSection) setActiveSection(sections[0].id);
  }, [sectionsMap, courseId, activeSection]);

  // جلب محتوى واختبارات القسم النشط
  useEffect(() => {
    if (activeSection) {
      fetchContents(activeSection);
      fetchQuizzes(activeSection);
    }
  }, [activeSection, fetchContents, fetchQuizzes]);

  // جلب حالة حل الكويزات (للطالب فقط)
  useEffect(() => {
    async function fetchSolvedQuizzes() {
      if (!user || isTeacher || !activeSection) {
        setQuizSolveStatus({});
        return;
      }
      const quizzes = quizzesMap[activeSection] || [];
      if (!quizzes.length) {
        setQuizSolveStatus({});
        return;
      }
      const quizIds = quizzes.map(q => q.id);
      const { data: solved = [] } = await supabase
        .from("quiz_answers")
        .select("quiz_id")
        .in("quiz_id", quizIds)
        .eq("user_id", user.id);
      const solvedObj = {};
      solved.forEach(row => { solvedObj[row.quiz_id] = true; });
      setQuizSolveStatus(solvedObj);
    }
    fetchSolvedQuizzes();
    // eslint-disable-next-line
  }, [activeSection, quizzesMap, user, isTeacher]);

  const sections = sectionsMap[courseId] || [];
  const currentSection = sections.find((s) => s.id === activeSection);

  async function handleDelete(target) {
    if (!target) return;
    if (target.type === "section") {
      await deleteSection(target.id, courseId);
    } else if (target.type === "content") {
      await deleteContent(target.id, activeSection);
    } else if (target.type === "quiz") {
      await deleteQuiz(target.id, activeSection);
    }
    setDeleteTarget(null);
  }

  return (
    <div>
      {/* قائمة الأقسام */}
      <SectionList
        sections={sections}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        setActiveTab={setActiveTab}
        isTeacher={isTeacher}
        onEdit={(section) => {
          setEditSection(section);
          setShowSectionForm(true);
        }}
        onDelete={(section) =>
          setDeleteTarget({ type: "section", ...section })
        }
        onAdd={() => {
          setEditSection(null);
          setShowSectionForm(true);
        }}
      />

      {/* تبويبات محتوى/اختبارات */}
      <div className="flex gap-0.5 mb-3">
        <button
          onClick={() => setActiveTab("contents")}
          className={`flex-1 py-2 rounded-t-xl font-bold transition
              ${activeTab === "contents"
              ? "bg-orange-500 text-white"
              : "bg-slate-50 text-slate-700 hover:bg-orange-100"
            }
            `}
        >
          <FileText size={18} /> محتوى
        </button>
        <button
          onClick={() => setActiveTab("quizzes")}
          className={`flex-1 py-2 rounded-t-xl font-bold transition
              ${activeTab === "quizzes"
              ? "bg-orange-500 text-white"
              : "bg-slate-50 text-slate-700 hover:bg-orange-100"
            }
            `}
        >
          <ListChecks size={18} /> اختبارات
        </button>
      </div>

      {/* محتوى القسم */}
      {currentSection && (
        <div>
          {activeTab === "contents" && (
            <>
              <SectionContentList
                contents={contentsMap[activeSection] || []}
                isTeacher={isTeacher}
                onAdd={() => {
                  setEditContent(null);
                  setShowContentForm(true);
                }}
                onEdit={(content) => {
                  setEditContent(content);
                  setShowContentForm(true);
                }}
                onDelete={(content) =>
                  setDeleteTarget({ type: "content", ...content })
                }
              />
              {showContentForm && (
                <ContentFormModal
                  content={editContent}
                  sectionId={currentSection.id}
                  onClose={() => setShowContentForm(false)}
                  onSaved={() => fetchContents(activeSection)}
                />
              )}
            </>
          )}

          {activeTab === "quizzes" && (
            <>
              <div className="flex flex-col gap-4">
                {(quizzesMap[activeSection]?.length === 0 || !quizzesMap[activeSection]) && (
                  <div className="text-gray-500">
                    لا يوجد اختبارات بعد في هذا القسم.
                  </div>
                )}
                {(quizzesMap[activeSection] || []).map((quiz) => {
                  const hasSolved = !!quizSolveStatus[quiz.id];
                  return (
                    <div
                      key={quiz.id}
                      className="bg-blue-50 p-4 rounded-xl shadow flex flex-col relative"
                    >
                      <div className="flex gap-2 items-center mb-1">
                        <span className="font-bold text-blue-950 text-lg">
                          {quiz.title}
                        </span>
                        {isTeacher && (
                          <div className="ml-auto flex gap-1">
                            <button
                              title="تعديل"
                              onClick={() => {
                                setEditQuiz(quiz);
                                setShowQuizForm(true);
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              title="حذف"
                              onClick={() =>
                                setDeleteTarget({ type: "quiz", ...quiz })
                              }
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                      <Button
                        className={`
                          mt-2 flex items-center gap-1 px-3 py-1 rounded-lg
                          ${isTeacher
                            ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                            : hasSolved
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                          }
                        `}
                        onClick={() => {
                          if (isTeacher) {
                            navigate(`/quizzes/${quiz.id}/questions`);
                          } else if (hasSolved) {
                            navigate(`/quizzes/${quiz.id}/solve`);
                          } else {
                            navigate(`/quizzes/${quiz.id}/solve`);
                          }
                        }}
                      >
                        {isTeacher
                          ? "إدارة أسئلة الاختبار"
                          : hasSolved
                            ? "عرض نتيجتي"
                            : "بدء الاختبار"}
                      </Button>
                    </div>
                  );
                })}
              </div>
              {isTeacher && (
                <Button
                  className="mt-4 bg-blue-950 hover:bg-blue-900"
                  onClick={() => {
                    setEditQuiz(null);
                    setShowQuizForm(true);
                  }}
                >
                  إضافة اختبار جديد
                </Button>
              )}
              {showQuizForm && (
                <QuizFormModal
                  quiz={editQuiz}
                  sectionId={currentSection.id}
                  onClose={() => setShowQuizForm(false)}
                  onSaved={() => fetchQuizzes(activeSection)}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* فورم القسم */}
      {showSectionForm && (
        <SectionFormModal
          section={editSection}
          courseId={courseId}
          onClose={() => setShowSectionForm(false)}
          onSaved={() => fetchSections(courseId)}
        />
      )}

      {/* مودال التأكيد للحذف */}
      {deleteTarget && (
        <DeleteConfirmation
          title={`حذف ${deleteTarget.type === "section"
            ? "القسم"
            : deleteTarget.type === "content"
              ? "المحتوى"
              : "الاختبار"
            }`}
          message={`هل أنت متأكد أنك تريد حذف هذا الـ${deleteTarget.type === "section"
            ? "القسم"
            : deleteTarget.type === "content"
              ? "المحتوى"
              : "الاختبار"
            }؟ لا يمكن التراجع!`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}
    </div>
  );
}
