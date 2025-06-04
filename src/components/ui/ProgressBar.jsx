export function ProgressBar({ percent = 0, barClass = "" }) {
    let color =
        percent >= 80
            ? "bg-green-500"
            : percent >= 50
                ? "bg-orange-400"
                : "bg-red-400";
    return (
        <div className={`w-full bg-slate-200 rounded-xl h-3.5 overflow-hidden shadow-inner ${barClass}`}>
            <div
                className={`
          h-full transition-all duration-700 ease-in-out ${color}
          rounded-xl
        `}
                style={{ width: `${Math.min(percent, 100)}%` }}
            />
        </div>
    );
}
