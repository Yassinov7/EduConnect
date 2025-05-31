// src/components/ui/Card.jsx
export function Card({ children, className = "" }) {
    return (
        <div className={`bg-white rounded-xl shadow p-5 ${className}`}>
            {children}
        </div>
    );
}

export default Card;
