import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import LandingPage from "../pages/LandingPage";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

export default function HomeRedirector() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner text="جارٍ التحقق من الحساب..." />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}
