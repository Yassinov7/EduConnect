// src/pages/Quiz/QuizQuestionsPageWrapper.jsx
import { useParams } from "react-router-dom";
import QuizQuestionsPage from "./QuizQuestionsPage";
import { useAuth } from "../../../../contexts/AuthProvider";

export default function QuizQuestionsPageWrapper() {
  const { quizId } = useParams();
  const { profile } = useAuth();
  const isTeacher = profile?.role === "teacher";
  if (!quizId) return <div>جاري التحميل...</div>;
  return <QuizQuestionsPage quizId={quizId} isTeacher={isTeacher} />;
}
