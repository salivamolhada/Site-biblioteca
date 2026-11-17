import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Gift, Sparkles } from 'lucide-react';

interface FallingGift {
  id: number;
  startX: number; // percentage 10-85
  color: 'crimson' | 'emerald' | 'gold' | 'royal';
  rotation: number;
  duration: number;
}

interface LandedGift {
  id: number;
  x: number;
  color: 'crimson' | 'emerald' | 'gold' | 'royal';
}

interface ChristmasOverlayProps {
  enabled: boolean;
  triggerFlySignal: number;
}

const SANTA_PHRASES = [
  'HO HO HO! Feliz Natal, Unidade Polo!',
  'HO HO HO! Presentes e livros para a escola!',
  'HO HO HO! Boas leituras neste Natal!',
  'HO HO HO! Papai Noel chegou na biblioteca!',
];

const GIFT_PALETTES = {
  crimson: { box: '#DC2626', border: '#991B1B', ribbon: '#FBBF24' },
  emerald: { box: '#059669', border: '#065F46', ribbon: '#FDE047' },
  gold: { box: '#D97706', border: '#92400E', ribbon: '#EF4444' },
  royal: { box: '#B91C1C', border: '#7F1D1D', ribbon: '#ECFDF5' },
};

// Deterministic snowflake positions to avoid re-render jitter
const SNOWFLAKES = Array.from({ length: 34 }, (_, i) => ({
  id: i,
  left: ((i * 29 + 7) % 98) + 1,
  size: (i % 3) * 2 + 3,
  duration: 9 + (i % 7) * 2.2,
  delay: -(i * 1.1),
  opacity: 0.25 + (i % 4) * 0.15,
}));

export const ChristmasOverlay: React.FC<ChristmasOverlayProps> = ({
  enabled,
  triggerFlySignal,
}) => {
  const [isFlying, setIsFlying] = useState(false);
  const [flightKey, setFlightKey] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fallingGifts, setFallingGifts] = useState<FallingGift[]>([]);
  const [landedGifts, setLandedGifts] = useState<LandedGift[]>([]);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [showGiftToast, setShowGiftToast] = useState<string | null>(null);
  const giftIdRef = useRef(1);
  const timersRef = useRef<number[]>([]);

  const clearFlightTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  const launchSantaFlight = useCallback(() => {
    if (!enabled) return;
    clearFlightTimers();

    setPhraseIndex((prev) => (prev + 1) % SANTA_PHRASES.length);
    setFlightKey((prev) => prev + 1);
    setIsFlying(true);

    // Schedule 5 presents dropping sequentially as Santa flies across the sky over the school
    const dropSchedule = [
      { delayMs: 1400, x: 18, color: 'crimson' as const },
      { delayMs: 2800, x: 34, color: 'gold' as const },
      { delayMs: 4200, x: 50, color: 'emerald' as const },
      { delayMs: 5600, x: 67, color: 'royal' as const },
      { delayMs: 7000, x: 82, color: 'gold' as const },
    ];

    dropSchedule.forEach((drop) => {
      const dropTimer = window.setTimeout(() => {
        const id = giftIdRef.current++;
        const fallDuration = 2.6;
        setFallingGifts((prev) => [
          ...prev,
          {
            id,
            startX: drop.x,
            color: drop.color,
            rotation: (id % 2 === 0 ? 1 : -1) * (15 + (id % 20)),
            duration: fallDuration,
          },
        ]);

        // When the gift lands on the school at the bottom
        const landTimer = window.setTimeout(() => {
          setFallingGifts((prev) => prev.filter((g) => g.id !== id));
          setDeliveredCount((c) => c + 1);
          setLandedGifts((prev) => {
            const next = [...prev, { id, x: drop.x, color: drop.color }];
            return next.slice(-8); // keep up to 8 visible stacked gifts in front of the school
          });
        }, fallDuration * 1000 - 150);

        timersRef.current.push(landTimer);
      }, drop.delayMs);

      timersRef.current.push(dropTimer);
    });

    // End flight after animation finishes
    const endTimer = window.setTimeout(() => {
      setIsFlying(false);
    }, 10500);
    timersRef.current.push(endTimer);
  }, [enabled, clearFlightTimers]);

  // Launch immediately on mount and repeat periodically every 20s
  useEffect(() => {
    if (!enabled) {
      setIsFlying(false);
      setFallingGifts([]);
      clearFlightTimers();
      return;
    }

    const initialTimer = window.setTimeout(() => {
      launchSantaFlight();
    }, 800);

    const intervalId = window.setInterval(() => {
      launchSantaFlight();
    }, 20000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalId);
      clearFlightTimers();
    };
  }, [enabled, launchSantaFlight, clearFlightTimers]);

  // Trigger manual Santa flight when user clicks "Chamar Papai Noel"
  useEffect(() => {
    if (triggerFlySignal > 0 && enabled) {
      launchSantaFlight();
    }
  }, [triggerFlySignal, enabled, launchSantaFlight]);

  const handleGiftClick = () => {
    const messages = [
      '🎁 Você abriu um presente de Natal! Desejamos ótimas leituras no Colégio Unidade Polo!',
      '📚 Presente Literário: Leia um clássico brasileiro nestas férias!',
      '🎄 Feliz Natal! Papai Noel deixou mais livros novinhos na biblioteca da escola!',
    ];
    setShowGiftToast(messages[deliveredCount % messages.length]);
    window.setTimeout(() => setShowGiftToast(null), 4000);
  };

  if (!enabled) return null;

  return (
    <>
      {/* 1. Gentle Snowfall Atmosphere (Pointer-events-none so UI remains 100% clickable) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-30 overflow-hidden christmas-snow-container"
      >
        {SNOWFLAKES.map((flake) => (
          <span
            key={flake.id}
            className="christmas-snowflake absolute -top-4 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
            style={{
              left: `${flake.left}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              animationDuration: `${flake.duration}s`,
              animationDelay: `${flake.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 2. Flying Santa Claus, Reindeer & "HO HO HO!" Speech Bubble */}
      {isFlying && (
        <div
          key={flightKey}
          aria-hidden="true"
          className="fixed top-20 sm:top-24 left-0 z-50 pointer-events-none christmas-santa-flight"
        >
          <div className="relative flex flex-col items-start">
            {/* Speech Bubble: "HO HO HO!" */}
            <div className="mb-1 ml-2 sm:ml-6 bg-white text-stone-950 px-3.5 py-2 rounded-2xl rounded-bl-xs shadow-2xl border-2 border-red-600 flex items-center gap-2 christmas-bubble-pop">
              <span className="inline-block w-2 h-2 rounded-full bg-red-600 shrink-0" />
              <span className="font-extrabold text-xs sm:text-sm tracking-tight whitespace-nowrap text-red-700">
                {SANTA_PHRASES[phraseIndex]}
              </span>
            </div>

            {/* Sleigh + Santa + Reindeer Team SVG */}
            <svg
              viewBox="0 0 420 120"
              className="w-[290px] sm:w-[390px] md:w-[430px] h-auto drop-shadow-[0_10px_18px_rgba(0,0,0,0.6)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Magic Stardust Trail behind the sleigh */}
              <circle cx="14" cy="72" r="2.5" fill="#FDE047" opacity="0.8" />
              <circle cx="28" cy="64" r="1.8" fill="#FBBF24" opacity="0.9" />
              <circle cx="40" cy="78" r="3" fill="#FEF08A" opacity="0.7" />
              <circle cx="56" cy="68" r="2" fill="#F59E0B" opacity="0.85" />

              {/* Golden Reins connecting Sleigh to Reindeer */}
              <path
                d="M158 58 Q205 68 250 56 L360 54"
                stroke="#FBBF24"
                strokeWidth="1.8"
                strokeDasharray="3 2"
              />
              <path
                d="M158 62 Q205 74 252 62 L358 60"
                stroke="#F59E0B"
                strokeWidth="1.4"
              />

              {/* Sleigh Runners (Golden Skis) */}
              <path
                d="M52 98 H150 C162 98 170 88 166 80"
                stroke="#FBBF24"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <path d="M74 86 V98 M128 86 V98" stroke="#F59E0B" strokeWidth="3.5" />

              {/* Sack of Presents in the back of the Sleigh */}
              <ellipse cx="78" cy="64" rx="22" ry="18" fill="#92400E" stroke="#78350F" strokeWidth="2" />
              <rect x="64" y="42" width="14" height="14" rx="2" fill="#EF4444" transform="rotate(-12 64 42)" />
              <rect x="69" y="42" width="3" height="14" fill="#FDE047" transform="rotate(-12 64 42)" />
              <rect x="80" y="40" width="13" height="13" rx="2" fill="#10B981" transform="rotate(14 80 40)" />
              <rect x="85" y="40" width="3" height="13" fill="#FDE047" transform="rotate(14 80 40)" />

              {/* Santa Claus in Sleigh */}
              {/* Santa Body / Red Suit */}
              <path
                d="M106 48 C106 40 128 40 128 52 V74 H102 L106 48 Z"
                fill="#DC2626"
              />
              {/* Santa Belt */}
              <rect x="104" y="61" width="24" height="5" fill="#1C1917" />
              <rect x="114" y="60" width="6" height="7" rx="1" stroke="#FBBF24" strokeWidth="1.5" fill="none" />
              {/* Santa Waving Arm */}
              <path
                d="M124 52 L140 36"
                stroke="#DC2626"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle cx="141" cy="35" r="4" fill="#FFFFFF" />
              {/* Santa Head & Beard */}
              <circle cx="117" cy="36" r="10" fill="#FED7AA" />
              {/* Fluffy White Beard */}
              <path
                d="M108 38 C108 50 126 52 127 40 C123 43 114 43 108 38 Z"
                fill="#FFFFFF"
              />
              {/* Santa Mustache & Smile */}
              <circle cx="122" cy="35" r="2" fill="#FCA5A5" />
              <circle cx="119" cy="32" r="1.4" fill="#1C1917" />
              {/* Santa Hat */}
              <path
                d="M105 31 C107 18 122 16 127 28 L105 31 Z"
                fill="#DC2626"
              />
              <path d="M104 31 H128" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
              <circle cx="103" cy="24" r="3.5" fill="#FFFFFF" />

              {/* Crimson & Gold Sleigh Body */}
              <path
                d="M54 64 H92 C98 76 112 78 126 70 L156 58 C162 66 158 88 138 88 H68 C54 88 50 76 54 64 Z"
                fill="#B91C1C"
                stroke="#FBBF24"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path d="M62 76 H144" stroke="#FDE047" strokeWidth="1.8" opacity="0.85" />

              {/* Back Reindeer (Dasher) */}
              <g className="christmas-reindeer-bob">
                {/* Legs */}
                <path d="M236 74 L228 92 M242 74 L240 93 M264 74 L274 90 M269 74 L278 86" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
                {/* Body */}
                <ellipse cx="253" cy="64" rx="20" ry="11" fill="#92400E" />
                {/* Neck & Head */}
                <path d="M266 60 L276 44 L288 46 L284 53 L272 58 Z" fill="#92400E" />
                {/* Antlers */}
                <path d="M277 44 L273 31 M275 37 L269 35 M276 34 L281 31" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
                {/* Tail */}
                <circle cx="232" cy="61" r="3" fill="#FEF3C7" />
                {/* Red Collar */}
                <path d="M266 56 L273 63" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" />
              </g>

              {/* Middle Reindeer (Prancer) */}
              <g className="christmas-reindeer-bob-alt">
                <path d="M294 69 L285 88 M300 69 L298 89 M322 69 L332 85 M327 69 L336 81" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
                <ellipse cx="311" cy="59" rx="20" ry="11" fill="#A16207" />
                <path d="M324 55 L334 39 L346 41 L342 48 L330 53 Z" fill="#A16207" />
                <path d="M335 39 L331 26 M333 32 L327 30 M334 29 L339 26" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
                <circle cx="290" cy="56" r="3" fill="#FEF3C7" />
                <path d="M324 51 L331 58" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
              </g>

              {/* Lead Reindeer (Rudolph with Glowing Red Nose!) */}
              <g className="christmas-reindeer-bob">
                <path d="M352 64 L343 84 M358 64 L356 85 M380 64 L390 80 M385 64 L394 76" stroke="#78350F" strokeWidth="3.8" strokeLinecap="round" />
                <ellipse cx="369" cy="54" rx="21" ry="11.5" fill="#92400E" />
                <path d="M382 50 L392 34 L405 36 L401 44 L388 49 Z" fill="#92400E" />
                {/* Antlers */}
                <path d="M393 34 L389 20 M391 27 L385 24 M392 24 L398 20" stroke="#FDE68A" strokeWidth="2.2" strokeLinecap="round" />
                {/* Tail */}
                <circle cx="347" cy="51" r="3.2" fill="#FEF3C7" />
                {/* Festive Collar & Bell */}
                <path d="M382 46 L389 53" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
                <circle cx="389" cy="54" r="2.5" fill="#FBBF24" />
                {/* Eye */}
                <circle cx="395" cy="38" r="1.4" fill="#1C1917" />
                {/* Glowing Red Nose! */}
                <circle cx="406" cy="39" r="5" fill="#EF4444" opacity="0.35" />
                <circle cx="406" cy="39" r="3" fill="#EF4444" />
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* 3. Falling Presents Dropped from Santa's Sleigh onto the School */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
      >
        {fallingGifts.map((gift) => {
          const palette = GIFT_PALETTES[gift.color];
          return (
            <div
              key={gift.id}
              className="absolute top-28 christmas-gift-fall"
              style={{
                left: `${gift.startX}%`,
                animationDuration: `${gift.duration}s`,
                ['--gift-rotate' as string]: `${gift.rotation}deg`,
              }}
            >
              <svg width="34" height="34" viewBox="0 0 36 36" className="drop-shadow-lg">
                {/* Gift Box */}
                <rect x="5" y="12" width="26" height="20" rx="2.5" fill={palette.box} stroke={palette.border} strokeWidth="1.5" />
                {/* Lid */}
                <rect x="3" y="8" width="30" height="6" rx="2" fill={palette.box} stroke={palette.border} strokeWidth="1.5" />
                {/* Ribbon Vertical & Horizontal */}
                <rect x="16" y="8" width="4" height="24" fill={palette.ribbon} />
                <rect x="5" y="19" width="26" height="4" fill={palette.ribbon} />
                {/* Bow */}
                <path d="M18 8 C14 2 9 4 12 8 Z" fill={palette.ribbon} />
                <path d="M18 8 C22 2 27 4 24 8 Z" fill={palette.ribbon} />
              </svg>
            </div>
          );
        })}
      </div>

      {/* 4. Snowy School Skyline & Landed Presents at Bottom Edge */}
      <div className="fixed bottom-0 inset-x-0 z-30 pointer-events-none flex flex-col justify-end overflow-hidden">
        {/* School Rooftop Silhouette & Snowy Ground */}
        <div className="relative w-full h-14 sm:h-16 flex items-end justify-between px-4 sm:px-10">
          {/* Left School Wing Silhouette (Colégio Unidade Polo) */}
          <div className="hidden sm:flex items-end gap-1.5 opacity-95">
            <svg width="210" height="58" viewBox="0 0 210 58" fill="none">
              {/* Main School Building */}
              <rect x="14" y="22" width="120" height="36" fill="#181715" stroke="#44403C" strokeWidth="1.2" />
              {/* Snowy Pitched Roof */}
              <path d="M6 23 L74 6 L142 23 H6 Z" fill="#292524" stroke="#E7E5E4" strokeWidth="2.5" strokeLinejoin="round" />
              {/* School Clock / Crest */}
              <circle cx="74" cy="17" r="4" fill="#FBBF24" />
              {/* Warm Glowing Classroom Windows */}
              <rect x="26" y="30" width="12" height="12" rx="1" fill="#F59E0B" opacity="0.85" />
              <rect x="46" y="30" width="12" height="12" rx="1" fill="#FBBF24" opacity="0.9" />
              <rect x="90" y="30" width="12" height="12" rx="1" fill="#F59E0B" opacity="0.85" />
              <rect x="110" y="30" width="12" height="12" rx="1" fill="#FBBF24" opacity="0.9" />
              {/* School Main Entrance */}
              <rect x="66" y="34" width="16" height="24" rx="1.5" fill="#065F46" stroke="#FBBF24" strokeWidth="1" />
              {/* Decorated Christmas Tree beside School */}
              <polygon points="168,14 152,38 184,38" fill="#065F46" />
              <polygon points="168,24 148,50 188,50" fill="#047857" />
              <rect x="165" y="50" width="6" height="8" fill="#78350F" />
              <polygon points="168,8 170,13 175,13 171,16 172,21 168,18 164,21 165,16 161,13 166,13" fill="#FDE047" />
              <circle cx="163" cy="30" r="2" fill="#EF4444" />
              <circle cx="174" cy="34" r="2" fill="#FBBF24" />
              <circle cx="160" cy="43" r="2" fill="#FBBF24" />
              <circle cx="175" cy="45" r="2" fill="#EF4444" />
            </svg>
          </div>

          {/* Landed Presents Piled in the School Courtyard (Clickable for festive message!) */}
          <div className="flex-1 relative h-10">
            {landedGifts.map((gift, idx) => {
              const palette = GIFT_PALETTES[gift.color];
              return (
                <button
                  key={gift.id}
                  type="button"
                  onClick={handleGiftClick}
                  title="Clique para abrir este presente de Natal na escola!"
                  className="pointer-events-auto absolute bottom-1 transition-transform hover:scale-125 cursor-pointer christmas-gift-bounce"
                  style={{
                    left: `${Math.min(88, Math.max(8, gift.x))}%`,
                    zIndex: 10 + idx,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 36 36" className="drop-shadow-md">
                    <rect x="5" y="12" width="26" height="20" rx="2.5" fill={palette.box} stroke={palette.border} strokeWidth="1.5" />
                    <rect x="3" y="8" width="30" height="6" rx="2" fill={palette.box} stroke={palette.border} strokeWidth="1.5" />
                    <rect x="16" y="8" width="4" height="24" fill={palette.ribbon} />
                    <rect x="5" y="19" width="26" height="4" fill={palette.ribbon} />
                  </svg>
                </button>
              );
            })}
          </div>

          {/* Right Action Pill: Delivered Gifts Counter & Summon Santa */}
          <div className="pointer-events-auto mb-2 flex items-center gap-2 bg-[#181715]/95 backdrop-blur-md border border-red-500/40 rounded-full px-3.5 py-1.5 shadow-2xl text-xs">
            <Gift className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="text-stone-200 font-medium whitespace-nowrap">
              Presentes na escola:{' '}
              <strong className="text-amber-300 font-mono tabular-nums">{deliveredCount}</strong>
            </span>
            <button
              type="button"
              onClick={launchSantaFlight}
              disabled={isFlying}
              className="ml-1 px-2.5 py-0.5 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
              title="Fazer o Papai Noel passar voando novamente!"
            >
              <Sparkles className="w-3 h-3" />
              <span>{isFlying ? 'Voando...' : 'Chamar Noel'}</span>
            </button>
          </div>
        </div>

        {/* Snowbank ground strip */}
        <div className="h-2 w-full bg-gradient-to-r from-stone-200/90 via-white/95 to-stone-200/90 shadow-[0_-2px_12px_rgba(255,255,255,0.2)]" />
      </div>

      {/* Festive Gift Toast */}
      {showGiftToast && (
        <div className="fixed bottom-16 right-6 z-50 bg-[#1C1917] text-white px-4 py-3 rounded-xl shadow-2xl border border-amber-400/50 flex items-center gap-2.5 text-xs font-semibold max-w-sm animate-fade-in">
          <Gift className="w-4 h-4 text-red-400 shrink-0" />
          <span>{showGiftToast}</span>
        </div>
      )}
    </>
  );
};
