import { AuthProvider } from "./AuthProvider";
import { GlobalDataProvider } from "./GlobalDataProvider";
import { CoursesDataProvider } from "./CoursesDataContext";
import { CourseContentProvider } from "./CourseContentContext";
import { QuizDataProvider } from "./QuizDataProvider";

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <GlobalDataProvider>
        <CoursesDataProvider>
          <CourseContentProvider>
            <QuizDataProvider>
              {children}
            </QuizDataProvider>
          </CourseContentProvider>
        </CoursesDataProvider>
      </GlobalDataProvider>
    </AuthProvider>
  );
}
