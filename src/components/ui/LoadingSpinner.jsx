// مكون جاهز reusable
export function LoadingSpinner({ text = "جاري التحميل..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-300/70">
      <svg className="animate-spin h-12 w-12 text-orange-700 mb-4" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      <div className="text-slate-950 text-xl">{text}</div>
    </div>
  );
}

