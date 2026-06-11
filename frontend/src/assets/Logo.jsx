// CulturPass logo — Concept C vertical VIP pass
// Use size prop to control the logo size (default 48px wide)

const Logo = ({ size = 48 }) => {
    const scale = size / 70;
    const height = Math.round(100 * scale);

    return (
        <svg
            width={size}
            height={height}
            viewBox="0 0 70 100"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="CulturPass logo"
            role="img"
        >
            {/* Outer badge */}
            <rect x="1" y="1" width="68" height="98" rx="8" fill="#F5EBE0" stroke="#BA7517" strokeWidth="1.5"/>
            {/* Dashed inner border */}
            <rect x="1" y="1" width="68" height="98" rx="8" fill="none" stroke="#D4B8A8" strokeWidth="0.5" strokeDasharray="4 4"/>
            {/* Top clip tab */}
            <rect x="24" y="1" width="22" height="8" rx="4" fill="#BA7517"/>
            {/* Outer circle */}
            <circle cx="35" cy="32" r="14" fill="none" stroke="#BA7517" strokeWidth="1"/>
            {/* Inner circle */}
            <circle cx="35" cy="32" r="10" fill="none" stroke="#D4B8A8" strokeWidth="0.5"/>
            {/* CP monogram */}
            <text x="35" y="37" fontSize="11" fontWeight="700" fill="#BA7517" fontFamily="sans-serif" letterSpacing="0" textAnchor="middle">CP</text>
            {/* CULTUR text */}
            <text x="35" y="58" fontSize="11" fontWeight="500" fill="#3D2B1F" fontFamily="sans-serif" letterSpacing="2" textAnchor="middle">CULTUR</text>
            {/* PASS text */}
            <text x="35" y="70" fontSize="11" fontWeight="500" fill="#D85A30" fontFamily="sans-serif" letterSpacing="2" textAnchor="middle">PASS</text>
            {/* Divider line */}
            <line x1="14" y1="77" x2="56" y2="77" stroke="#D4B8A8" strokeWidth="0.5"/>
            {/* VIP ACCESS text */}
            <text x="35" y="88" fontSize="6.5" fill="#BA7517" fontFamily="sans-serif" letterSpacing="2" textAnchor="middle">VIP ACCESS</text>
        </svg>
    );
};

export default Logo;