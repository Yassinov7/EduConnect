import { useLocation, useNavigate } from "react-router-dom";

export default function GlobalBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide button on /dashboard
  if (location.pathname === "/dashboard" || location.pathname === "/") return null;

  return (
    <button
      onClick={() => navigate(-1)}
      className="fixed top-24 left-4 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-700 transition"
    >
      ⬅ العودة
    </button>
  );
}
