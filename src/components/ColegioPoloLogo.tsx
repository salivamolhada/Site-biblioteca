import React from 'react';

interface ColegioPoloLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const ColegioPoloLogo: React.FC<ColegioPoloLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const sizeMap = {
    sm: { box: 34, text: 'text-sm', sub: 'text-[10px]' },
    md: { box: 44, text: 'text-base', sub: 'text-[11px]' },
    lg: { box: 56, text: 'text-xl', sub: 'text-xs' },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Collegiate Shield Logo */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={current.box}
          height={current.box}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative drop-shadow-md transition-transform hover:scale-105"
        >
          {/* Shield Outer Shadow & Base */}
          <path
            d="M50 4 L86 18 V52 C86 74 70 90 50 96 C30 90 14 74 14 52 V18 L50 4 Z"
            fill="#1C1917"
            stroke="#D97706"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Shield Inner Background (Academic Emerald & Charcoal) */}
          <path
            d="M50 9 L81 21 V52 C81 71 67 86 50 91 C33 86 19 71 19 52 V21 L50 9 Z"
            fill="url(#collegiateEmeraldGrad)"
          />

          {/* Academic Torch of Knowledge (Center Top) */}
          <path
            d="M50 20 L53 30 H47 L50 20 Z"
            fill="#F59E0B"
          />
          <path
            d="M50 14 Q54 20 50 24 Q46 20 50 14 Z"
            fill="#EF4444"
          />
          <path
            d="M49 16 Q52 20 49 23 Q48 20 49 16 Z"
            fill="#FBBF24"
          />

          {/* Open Book of Wisdom & Science */}
          <path
            d="M28 42 C38 39 46 41 50 45 C54 41 62 39 72 42 V63 C62 60 54 62 50 66 C46 62 38 60 28 63 V42 Z"
            fill="#FFFDF7"
            stroke="#065F46"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Book Spine Center Line */}
          <path
            d="M50 45 V66"
            stroke="#D97706"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Book Pages Texture Lines */}
          <path d="M33 49 H45 M33 54 H43 M33 59 H41" stroke="#78716C" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M55 49 H67 M57 54 H67 M59 59 H67" stroke="#78716C" strokeWidth="1.5" strokeLinecap="round" />

          {/* Academic Star (Excellence Motif) */}
          <polygon
            points="50,73 52,78 57,78 53,81 55,86 50,83 45,86 47,81 43,78 48,78"
            fill="#F59E0B"
            stroke="#B45309"
            strokeWidth="0.8"
          />

          <defs>
            <linearGradient id="collegiateEmeraldGrad" x1="50" y1="9" x2="50" y2="91" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#065F46" />
              <stop offset="50%" stopColor="#064E3B" />
              <stop offset="100%" stopColor="#141311" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className={`font-black tracking-tight text-stone-100 font-sans ${current.text}`}>
              Colégio Unidade Polo
            </span>
          </div>
          <span className={`font-semibold text-stone-400 tracking-wide flex items-center gap-1.5 ${current.sub}`}>
            <span>Biblioteca Escolar</span>
            <span className="text-amber-500 font-bold">·</span>
            <span className="text-emerald-400 font-medium">Acervo Acadêmico</span>
          </span>
        </div>
      )}
    </div>
  );
};
