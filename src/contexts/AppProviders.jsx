import { useAuth } from "./AuthProvider";
import { GlobalDataProvider } from "./GlobalDataProvider";
import { CoursesDataProvider } from "./CoursesDataContext";
import { CourseContentProvider } from "./CourseContentContext";
import { QuizDataProvider } from "./QuizDataProvider";
import { TeacherDashboardDataProvider } from "./TeacherDashboardDataProvider";
import { StudentDashboardDataProvider } from './StudentDashboardDataProvider';
import { ProgressProvider } from "./ProgressContext";
export default function AppProviders({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // أو spinner مؤقت

  return (
    // <AuthProvider>
    <GlobalDataProvider>
      <CoursesDataProvider>
        <CourseContentProvider>
          <QuizDataProvider>
            <ProgressProvider>
            <TeacherDashboardDataProvider userId={user?.id}>
              <StudentDashboardDataProvider userId={user?.id}>
                {children}
              </StudentDashboardDataProvider>
            </TeacherDashboardDataProvider>
            </ProgressProvider>
          </QuizDataProvider>
        </CourseContentProvider>
      </CoursesDataProvider>
    </GlobalDataProvider>
    // </AuthProvider>
  );
}
