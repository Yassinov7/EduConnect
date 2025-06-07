import { useAuth } from "./AuthProvider";
import { GlobalDataProvider } from "./GlobalDataProvider";
import { CoursesDataProvider } from "./CoursesDataContext";
import { CourseContentProvider } from "./CourseContentContext";
import { QuizDataProvider } from "./QuizDataProvider";
import { TeacherDashboardDataProvider } from "./TeacherDashboardDataProvider";
import { StudentDashboardDataProvider } from './StudentDashboardDataProvider';
import { ProgressProvider } from "./ProgressContext";
import { ChatProvider } from "./ChatContext";
import { ContactsProvider } from "./ContactsContext";

export default function AppProviders({ children }) {
  const { user, profile, loading } = useAuth();
  
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
                  <ChatProvider userId={user?.id}>
                    <ContactsProvider currentUser={profile}>
                      {children}
                    </ContactsProvider>
                  </ChatProvider>
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
