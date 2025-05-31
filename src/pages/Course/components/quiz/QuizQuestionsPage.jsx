// components/quiz/QuizQuestionsPage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../../../services/supabaseClient";
import Button from "../../../../components/ui/Button";
import { Edit, Trash2, PlusCircle } from "lucide-react";
import QuizQuestionFormModal from "./QuizQuestionFormModal";
import DeleteConfirmation from "../../../../components/ui/DeleteConfirmation";

export default function QuizQuestionsPage({ quizId, isTeacher }) {
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line
  }, [quizId]);

  async function fetchQuestions() {
    const { data = [] } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: true });
    setQuestions(data);
  }

  async function handleDelete(id) {
    await supabase.from("quiz_questions").delete().eq("id", id);
    setDeleteTarget(null);
    fetchQuestions();
  }

  return (
    <div className="mx-auto max-w-2xl py-6 px-2">
      <h2 className="text-2xl font-extrabold mb-6 text-orange-600 flex items-center gap-2">
        <span className="bg-orange-100 rounded-xl px-3 py-1">إدارة أسئلة الاختبار</span>
      </h2>
      <div className="flex flex-col gap-5">
        {questions.length === 0 && (
          <div className="text-gray-500 text-center">لا يوجد أسئلة بعد.</div>
        )}
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-blue-50 rounded-2xl shadow-lg px-6 py-5 flex flex-col gap-1 border border-blue-100 hover:border-orange-300 transition">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-blue-900">{idx + 1}. {q.question_text}</span>
              {isTeacher && (
                <div className="ml-auto flex gap-1">
                  <button title="تعديل" onClick={() => { setEditQuestion(q); setShowForm(true); }}>
                    <Edit size={18} className="text-blue-950 hover:text-orange-500" />
                  </button>
                  <button title="حذف" onClick={() => setDeleteTarget(q.id)}>
                    <Trash2 size={18} className="text-red-500 hover:text-red-700" />
                  </button>
                </div>
              )}
            </div>
            <ul className="mt-2 flex flex-col gap-1 pl-6 list-[lower-alpha] text-slate-900">
              <li className={q.correct_option === "a" ? "font-bold text-gray-800 bg-green-500  rounded px-2" : ""}>
                {q.option_a} {q.correct_option === "a" && <span className="text-xs">(الصحيحة)</span>}
              </li>
              <li className={q.correct_option === "b" ? "font-bold text-gray-800 bg-green-500 rounded px-2" : ""}>
                {q.option_b} {q.correct_option === "b" && <span className="text-xs">(الصحيحة)</span>}
              </li>
              <li className={q.correct_option === "c" ? "font-bold text-gray-800 bg-green-500 rounded px-2" : ""}>
                {q.option_c} {q.correct_option === "c" && <span className="text-xs">(الصحيحة)</span>}
              </li>
              <li className={q.correct_option === "d" ? "font-bold text-gray-800 bg-green-500 rounded px-2" : ""}>
                {q.option_d} {q.correct_option === "d" && <span className="text-xs">(الصحيحة)</span>}
              </li>
            </ul>
          </div>
        ))}
      </div>

      {isTeacher && (
        <Button
          className="mt-7 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-5 rounded-xl shadow flex items-center gap-2 mx-auto"
          onClick={() => { setEditQuestion(null); setShowForm(true); }}
        >
          <PlusCircle size={20} /> إضافة سؤال جديد
        </Button>
      )}

      {showForm && (
        <QuizQuestionFormModal
          quizId={quizId}
          question={editQuestion}
          onClose={() => setShowForm(false)}
          onSaved={fetchQuestions}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmation
          title="حذف السؤال"
          message="هل أنت متأكد أنك تريد حذف هذا السؤال؟ لا يمكن التراجع!"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}
    </div>
  );
}
