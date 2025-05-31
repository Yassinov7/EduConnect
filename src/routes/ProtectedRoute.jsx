// src/routes/ProtectedRoute.jsx
import { useAuth } from "../contexts/AuthProvider";
import { Navigate, Outlet } from "react-router-dom";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
      return <LoadingSpinner text="جاري التحقق من الجلسة ..." />;
    }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
