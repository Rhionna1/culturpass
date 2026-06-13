// FunctionPass logo — VIP pass badge with FP circle monogram
// Use size prop to control the logo size (default 48px wide)

const Logo = ({ size = 48 }) => {
    const height = Math.round((100 / 70) * size);

    return (
        <svg
            width={size}
            height={height}
            viewBox="0 0 70 100"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="FunctionPass logo"
            role="img"
        >
            {/* Outer badge */}
            <rect x="1" y="1" width="68" height="98" rx="8" fill="#1A0F0A" stroke="#BA7517" strokeWidth="1.5"/>
            {/* Top clip tab */}
            <rect x="24" y="1" width="22" height="8" rx="4" fill="#BA7517"/>
            {/* Circle */}
            <circle cx="35" cy="42" r="22" fill="none" stroke="#BA7517" strokeWidth="1"/>
            {/* FP monogram */}
            <text x="35" y="48" fontSize="20" fontWeight="700" fill="#F5EBE0" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="middle">FP</text>
            {/* VIP text */}
            <text x="35" y="78" fontSize="10" fontWeight="500" fill="#BA7517" fontFamily="sans-serif" letterSpacing="4" textAnchor="middle">VIP</text>
        </svg>
    );
};

export default Logo;