import { useEffect, useState } from "react";
import { supabase } from "../../../../services/supabaseClient";
import Button from "../../../../components/ui/Button";
import SectionList from "./SectionList";
import SectionContentList from "./SectionContentList";
import SectionFormModal from "../SectionFormModal";
import ContentFormModal from "../ContentFormModal";
import QuizFormModal from "../QuizFormModal";
import DeleteConfirmation from "../../../../components/ui/DeleteConfirmation";
import { FileText, ListChecks } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthProvider"; // ضروري

export default function SectionTabs({ courseId, isTeacher }) {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [activeTab, setActiveTab] = useState("contents");
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [showContentForm, setShowContentForm] = useState(false);
  const [editContent, setEditContent] = useState(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [quizSolveStatus, setQuizSolveStatus] = useState({}); // { [quizId]: true/false }
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // جلب الأقسام + المحتوى + الكويزات
  useEffect(() => {
    fetchSectionsAndContents();
    // eslint-disable-next-line
  }, [courseId]);

  async function fetchSectionsAndContents() {
    const { data: sections = [] } = await supabase
      .from("sections")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: true });

    if (!sections.length) {
      setSections([]);
      setActiveSection(null);
      return;
    }

    const sectionIds = sections.map((s) => s.id);
    const { data: contents = [] } = await supabase
      .from("contents")
      .select("*")
      .in("section_id", sectionIds);

    const { data: quizzes = [] } = await supabase
      .from("quizzes")
      .select("*")
      .in("section_id", sectionIds);

    const sectionsWithData = sections.map((section) => ({
      ...section,
      contents: contents.filter((c) => c.section_id === section.id),
      quizzes: quizzes.filter((q) => q.section_id === section.id),
    }));

    setSections(sectionsWithData);

    if (!activeSection && sectionsWithData.length > 0) {
      setActiveSection(sectionsWithData[0].id);
    }

    // جلب حالة الحل لكل كويز للطالب فقط
    if (user && !isTeacher && quizzes.length > 0) {
      // جلب كل نتائج الطالب لهذه الكويزات دفعة واحدة
      const quizIds = quizzes.map((q) => q.id);
      const { data: solved = [] } = await supabase
        .from("quiz_answers")
        .select("quiz_id")
        .in("quiz_id", quizIds)
        .eq("user_id", user.id);

      // استخراج حالة الحل لكل كويز
      const solvedObj = {};
      solved.forEach((row) => { solvedObj[row.quiz_id] = true; });
      setQuizSolveStatus(solvedObj);
    } else {
      setQuizSolveStatus({});
    }
  }

  useEffect(() => {
    if (sections.length && !activeSection) setActiveSection(sections[0].id);
  }, [sections, activeSection]);

  const currentSection = sections.find((s) => s.id === activeSection);

  async function handleDelete(target) {
    if (!target) return;
    if (target.type === "section") {
      await supabase.from("sections").delete().eq("id", target.id);
    } else if (target.type === "content") {
      await supabase.from("contents").delete().eq("id", target.id);
    } else if (target.type === "quiz") {
      await supabase.from("quizzes").delete().eq("id", target.id);
    }
    setDeleteTarget(null);
    fetchSectionsAndContents();
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
                contents={currentSection.contents}
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
                  onSaved={fetchSectionsAndContents}
                />
              )}
            </>
          )}

          {activeTab === "quizzes" && (
            <>
              <div className="flex flex-col gap-4">
                {currentSection.quizzes.length === 0 && (
                  <div className="text-gray-500">
                    لا يوجد اختبارات بعد في هذا القسم.
                  </div>
                )}
                {currentSection.quizzes.map((quiz) => {
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
                  onSaved={fetchSectionsAndContents}
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
          onSaved={fetchSectionsAndContents}
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
