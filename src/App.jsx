import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import RegisterPage from "./pages/Auth/RegisterPage";
import LoginPage from "./pages/Auth/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProfilePage from "./pages/Profile/ProfilePage";
import PersonalDetailsFormWrapper from "./pages/Profile/PersonalDetailsFormWrapper";
import PasswordResetPage from "./pages/Profile/PasswordResetPage";
import Layout from "./components/ui/Layout";
import ChatPage from "./pages/Chat/ChatPage";
import CoursesPage from "./pages/Course/CoursesPage";
import DashboardRouter from "./routes/DashboardRouter";
import { GlobalDataProvider } from "./contexts/GlobalDataProvider";
import { AuthProvider, useAuth } from "./contexts/AuthProvider";
import NotFound from "./pages/NotFound";
import CategoriesPage from "./pages/Categorie/CategoriesPage";
import CoursesManagementPage from "./pages/Course/CoursesManagementPage";
import CourseDetailPage from "./pages/Course/CourseDetailPage";
import QuizQuestionsPageWrapper from "./pages/Course/components/quiz/QuizQuestionsPageWrapper";
import QuizSolvePage from "./pages/Course/components/quiz/QuizSolvePage";
import StudentQuizResultsPage from './pages/Course/components/quiz/StudentQuizResultsPage';
import QuizAnswersPage from "./pages/Course/components/quiz/QuizAnswersPage";
import StudentAllResultsPage from "./pages/Course/components/quiz/StudentAllResultsPage";
// صفحة الهبوط
function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-950/60">
      <h1 className="text-4xl font-bold text-orange-500">EduConnect </h1>
      <Link to="/register" className="bg-orange-500 px-4 py-2 rounded text-white font-bold shadow">
        إنشاء حساب جديد
      </Link>
      <Link to="/login" className="bg-white px-4 py-2 rounded font-bold shadow">
        تسجيل دخول
      </Link>
    </div>
  );
}

// مكون ذكي لعرض الصفحة الرئيسية حسب حالة المستخدم
function HomeRedirector() {
  const { user, loading } = useAuth();

  if (loading) return null; // أو سبينر بسيط
  if (user) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <GlobalDataProvider>
        <BrowserRouter>
          <Routes>
            {/* صفحات عامة خارج النظام المحمي */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* الصفحة الرئيسية: توجيه حسب حالة الدخول */}
            <Route path="/" element={<HomeRedirector />} />

            {/* كل الصفحات المحمية بداخل الـ Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<PersonalDetailsFormWrapper />} />
                <Route path="/profile/password" element={<PasswordResetPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/courses/manage" element={<CoursesManagementPage />} />
                <Route path="/courses/:id" element={<CourseDetailPage />} />
                <Route path="/quizzes/:quizId/questions" element={<QuizQuestionsPageWrapper />} />
                <Route path="/quizzes/:quizId/solve" element={<QuizSolvePage />} />
                <Route path="/quiz/results/:courseId/:studentId" element={<StudentQuizResultsPage />} />
                <Route path="/quiz/answers/:quizId" element={<QuizAnswersPage />} />
                <Route path="/my-results" element={<StudentAllResultsPage />} />
              </Route>
            </Route>

            {/* صفحة 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GlobalDataProvider>
    </AuthProvider>
  );
}
