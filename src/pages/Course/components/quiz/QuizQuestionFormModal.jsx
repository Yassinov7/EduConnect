// components/quiz/QuizQuestionFormModal.jsx
import { useState, useEffect } from "react";
import Modal from "../../../../components/ui/Modal";
import Button from "../../../../components/ui/Button";
import { supabase } from "../../../../services/supabaseClient";

export default function QuizQuestionFormModal({ quizId, question, onClose, onSaved }) {
  const [values, setValues] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "a",
  });

  useEffect(() => {
    if (question) {
      setValues({
        question_text: question.question_text || "",
        option_a: question.option_a || "",
        option_b: question.option_b || "",
        option_c: question.option_c || "",
        option_d: question.option_d || "",
        correct_option: question.correct_option || "a",
      });
    } else {
      setValues({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "a",
      });
    }
  }, [question]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (
      !values.question_text.trim() ||
      !values.option_a.trim() ||
      !values.option_b.trim() ||
      !values.option_c.trim() ||
      !values.option_d.trim() ||
      !["a", "b", "c", "d"].includes(values.correct_option)
    ) {
      alert("يرجى إدخال كل الحقول وتحديد الإجابة الصحيحة");
      return;
    }

    const data = {
      quiz_id: quizId,
      question_text: values.question_text.trim(),
      option_a: values.option_a.trim(),
      option_b: values.option_b.trim(),
      option_c: values.option_c.trim(),
      option_d: values.option_d.trim(),
      correct_option: values.correct_option,
    };

    if (question && question.id) {
      await supabase.from("quiz_questions").update(data).eq("id", question.id);
    } else {
      await supabase.from("quiz_questions").insert([data]);
    }
    onClose();
    onSaved();
  }

  return (
    <Modal onClose={onClose} title={question ? "تعديل السؤال" : "إضافة سؤال جديد"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="font-bold text-blue-900 text-base mb-1">
          نص السؤال<span className="text-red-600">*</span>
        </label>
        <input
          className="border border-slate-200 rounded-xl px-4 py-2 text-base focus:ring-2 focus:ring-orange-300 transition outline-none font-medium"
          value={values.question_text}
          onChange={e => setValues(v => ({ ...v, question_text: e.target.value }))}
          required
          placeholder="اكتب نص السؤال هنا"
        />

        <label className="font-bold text-blue-900 text-base mt-2 mb-1">
          الخيارات <span className="text-red-600">*</span>
        </label>
        <div className="grid gap-2">
          {["a", "b", "c", "d"].map((opt) => (
            <div key={opt} className={`flex items-center gap-3 bg-orange-50 px-3 py-2 rounded-xl shadow-sm`}>
              <input
                type="radio"
                name="correct_option"
                checked={values.correct_option === opt}
                onChange={() => setValues(v => ({ ...v, correct_option: opt }))}
                className="accent-orange-600 w-5 h-5"
                required
                id={`correct_${opt}`}
              />
              <label htmlFor={`correct_${opt}`} className="font-bold text-orange-800 cursor-pointer w-7">
                {opt.toUpperCase()}
              </label>
              <input
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-200 outline-none font-medium bg-white"
                value={values[`option_${opt}`]}
                onChange={e => setValues(v => ({
                  ...v,
                  [`option_${opt}`]: e.target.value,
                }))}
                required
                placeholder={`الخيار ${opt.toUpperCase()}`}
              />
              {values.correct_option === opt && (
                <span className="ml-2 text-xs bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full">الإجابة الصحيحة</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            className="bg-gray-100 text-blue-900 rounded-xl font-bold px-6 py-2 hover:bg-orange-50 border border-slate-200 shadow"
            onClick={onClose}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            className="bg-orange-500 text-white rounded-xl font-bold px-6 py-2 hover:bg-orange-600 shadow"
          >
            {question ? "حفظ التعديلات" : "إضافة"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
