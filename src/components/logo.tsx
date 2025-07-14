const Logo = () => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-full"
    >
      <defs>
        <clipPath id="circleClip">
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>

      <g clipPath="url(#circleClip)">
        {/* Background */}
        <rect width="100" height="100" fill="#FFFFFF" />

        {/* Shield */}
        <path
          d="M50 15 C 40 20, 15 35, 15 55 L 15 80 L 50 95 L 85 80 L 85 55 C 85 35, 60 20, 50 15 Z"
          fill="#003366"
          stroke="#D4AF37"
          strokeWidth="3"
        />

        {/* Crown */}
        <path
          d="M30 32 L 25 20 L 50 25 L 75 20 L 70 32 Z"
          fill="#D4AF37"
          stroke="#003366"
          strokeWidth="1.5"
        />
        <circle cx="25" cy="18" r="3" fill="#D4AF37" />
        <circle cx="50" cy="23" r="3" fill="#D4AF37" />
        <circle cx="75" cy="18" r="3" fill="#D4AF37" />

        {/* Horizontal Divider */}
        <line x1="15" y1="55" x2="85" y2="55" stroke="#D4AF37" strokeWidth="3" />
        {/* Vertical Divider */}
        <line x1="50" y1="55" x2="50" y2="95" stroke="#D4AF37" strokeWidth="3" />

        {/* Top Section Icon (Book) */}
        <path
          d="M50 35 L 40 40 L 50 45 L 60 40 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <path d="M40 40 L 40 50 L 60 50 L 60 40" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="50" y1="45" x2="50" y2="50" stroke="#FFFFFF" strokeWidth="2" />

        {/* Bottom-Left Icon (Leaf) */}
        <path
          d="M32 65 C 35 65, 38 70, 32 80 C 26 70, 29 65, 32 65 M 32 65 L 32 85"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
        />

        {/* Bottom-Right Icon (Atom) */}
        <circle cx="68" cy="75" r="3" fill="#FFFFFF" />
        <ellipse cx="68" cy="75" rx="12" ry="5" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <ellipse cx="68" cy="75" rx="12" ry="5" transform="rotate(60 68 75)" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <ellipse cx="68" cy="75" rx="12" ry="5" transform="rotate(-60 68 75)" fill="none" stroke="#FFFFFF" strokeWidth="2" />
      </g>
    </svg>
  );
};

export default Logo;
