// src/hooks/useCourses.js
import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

/**
 * خيارات الاستخدام:
 * - جميع الدورات: useCourses()
 * - دورات معلم: useCourses({ teacherOnly: true, teacherId })
 * - دورات طالب: useCourses({ enrolledOnly: true, userId })
 * - فلترة حسب التصنيف: useCourses({ categoryId })
 * - بحث باسم الدورة: useCourses({ search })
 */
export function useCourses(options = {}) {
  const {
    teacherOnly = false,
    teacherId,
    enrolledOnly = false,
    userId,
    categoryId,
    search,
  } = options;
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    let query;
    if (enrolledOnly && userId) {
      // الطالب: جلب الدورات الملتحق بها
      query = supabase
        .from("course_enrollments")
        .select(
          `course_id,
            courses:course_id (
              *,
              categories:category_id ( name ),
              profiles:teacher_id ( full_name ),
              sections ( id ),
              course_enrollments ( id )
            )
          `
        )
        .eq("user_id", userId);
    } else {
      // كل الدورات أو دورات معلم
      query = supabase
        .from("courses")
        .select(
          `*,
            categories:category_id ( name ),
            profiles:teacher_id ( full_name ),
            sections ( id ),
            course_enrollments ( id )
          `
        );
      if (teacherOnly && teacherId) {
        query = query.eq("teacher_id", teacherId);
      }
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }
      if (search) {
        query = query.ilike("title", `%${search}%`);
      }
    }

    (async () => {
      try {
        const { data, error } = await query;

        if (error) throw error;

        let result = [];
        if (enrolledOnly && userId) {
          result = (data || []).map((en) => {
            const course = en.courses;
            return course && {
              ...course,
              category_name: course.categories?.name,
              teacher_name: course.profiles?.full_name,
              sections_count: course.sections?.length || 0,
              students_count: course.course_enrollments?.length || 0,
            };
          }).filter(Boolean);
        } else {
          result = (data || []).map((course) => ({
            ...course,
            category_name: course.categories?.name,
            teacher_name: course.profiles?.full_name,
            sections_count: course.sections?.length || 0,
            students_count: course.course_enrollments?.length || 0,
          }));
        }
        setCourses(result);
      } catch (err) {
        setError(err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    })();

    // eslint-disable-next-line
  }, [teacherOnly, teacherId, enrolledOnly, userId, categoryId, search]);

  return { courses, loading, error };
}
