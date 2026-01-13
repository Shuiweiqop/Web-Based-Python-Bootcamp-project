// resources/js/Components/ApplicationLogo.jsx
export default function ApplicationLogo({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 316 316" xmlns="http://www.w3.org/2000/svg">
            {/* 你的 Logo SVG */}
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="120" fontWeight="bold">
                E
            </text>
        </svg>
    );
}