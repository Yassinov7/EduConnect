// src/hooks/useProfile.js
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single()
      .then(({ data, error }) => {
        if (!error) setProfile(data);
        else setProfile(null);
        setLoading(false);
      });
  }, [userId]);

  return { profile, loading, setProfile };
}
