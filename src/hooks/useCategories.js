// src/hooks/useCategories.js
import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    async function fetchCategories() {
      try {
        // جلب التصنيفات مع عدد الدورات المرتبطة
        let { data, error } = await supabase
          .from("categories")
          .select(`
            *,
            courses: courses(id)
          `);

        if (error) throw error;

        setCategories(
          (data || []).map((cat) => ({
            ...cat,
            courses_count: cat.courses ? cat.courses.length : 0,
          }))
        );
        setError(null);
      } catch (err) {
        setError(err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
