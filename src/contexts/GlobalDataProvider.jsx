// src/contexts/GlobalDataContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const GlobalDataContext = createContext();

export function GlobalDataProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesRatings, setCoursesRatings] = useState({});

  // جلب التصنيفات
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("*, courses: courses(id)");
    setCategories(
      (data || []).map((cat) => ({
        ...cat,
        courses_count: cat.courses?.length || 0,
      }))
    );
    setCategoriesLoading(false);
  };

  // جلب الدورات
  const fetchCourses = async () => {
    setCoursesLoading(true);
    const { data } = await supabase
      .from("courses")
      .select("*, categories:category_id(name), profiles:teacher_id(full_name), sections(id), course_enrollments(id), prerequisite:prerequisite_id(id, title)");
    setCourses(
      (data || []).map((c) => ({
        ...c,
        category_name: c.categories?.name,
        teacher_name: c.profiles?.full_name,
        sections_count: c.sections?.length || 0,
        students_count: c.course_enrollments?.length || 0,
        prerequisite_title: c.prerequisite?.title,
      }))
    );
    setCoursesLoading(false);
  };

  // جلب التقييمات (ratings) لكل دورة
  const fetchCoursesRatings = async () => {
    const { data } = await supabase
      .from("course_comments")
      .select("course_id, rating")
      .not("rating", "is", null);

    const ratingsMap = {};
    (data || []).forEach(row => {
      if (!row.course_id || !row.rating) return;
      if (!ratingsMap[row.course_id]) {
        ratingsMap[row.course_id] = { sum: 0, count: 0 };
      }
      ratingsMap[row.course_id].sum += row.rating;
      ratingsMap[row.course_id].count += 1;
    });

    const result = {};
    Object.entries(ratingsMap).forEach(([courseId, { sum, count }]) => {
      result[courseId] = {
        avg: count ? (sum / count).toFixed(1) : "0.0",
        count,
      };
    });

    setCoursesRatings(result);
  };

  // عند بداية التطبيق: جلب الداتا مرة واحدة
  useEffect(() => {
    fetchCategories();
    fetchCourses();
    fetchCoursesRatings();
  }, []);

  return (
    <GlobalDataContext.Provider value={{
      categories, categoriesLoading, fetchCategories,
      courses, coursesLoading, fetchCourses,
      coursesRatings, fetchCoursesRatings,
    }}>
      {children}
    </GlobalDataContext.Provider>
  );
}

// هوك جاهز للاستخدام في أي مكان
export function useGlobalData() {
  return useContext(GlobalDataContext);
}
