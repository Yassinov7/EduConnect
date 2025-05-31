// src/components/ui/BackButton.jsx
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function BackButton({ to = -1 }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-1 text-orange-500 font-bold mb-4"
    >
      <ArrowRight size={18} />
      عودة
    </button>
  );
}
