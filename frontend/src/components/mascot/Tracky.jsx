import React from 'react';
import { motion } from 'framer-motion';

// Redesign notes:
// - body/arms/legs use a cool-to-deep-teal gradient (bodyGrad) built from the brand
//   teal-blue (#477082), instead of the warm coral gradient from the first pass
// - a dark glass "visor" sits across the eyes, like a little screen — eyes render as
//   a glow color (GLOW) inside it instead of plain dark dots
// - one warm amber accent (ACCENT) is kept, used sparingly for energy/celebration
const DARK = '#1c2f36';
const GLOW = '#bdf3ff';
const ACCENT = '#e8b04b';
const BLUSH = '#e3b3c2';
const SUCCESS = '#4fc48a';

const Defs = () => (
  <defs>
    <radialGradient id="bodyGrad" cx="35%" cy="20%" r="90%">
      <stop offset="0%" stopColor="#f2f8f9" />
      <stop offset="45%" stopColor="#ffffff" />
      <stop offset="72%" stopColor="#bcd8de" />
      <stop offset="100%" stopColor="#477082" />
    </radialGradient>
    <radialGradient id="rimGlow" cx="50%" cy="105%" r="55%">
      <stop offset="0%" stopColor="#8ad9e0" stopOpacity="0.28" />
      <stop offset="100%" stopColor="#8ad9e0" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="visorHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#8ad9e0" stopOpacity="0.4" />
      <stop offset="100%" stopColor="#8ad9e0" stopOpacity="0" />
    </radialGradient>
  </defs>
);

// The blob body + two rounded legs, shared by every expression
const Body = ({ opacity = 1 }) => (
  <g opacity={opacity}>
    <rect x="20" y="18" width="60" height="64" rx="28" ry="28" fill="url(#bodyGrad)" />
    <rect x="20" y="18" width="60" height="64" rx="28" ry="28" fill="url(#rimGlow)" />
    <ellipse cx="38" cy="85" rx="8" ry="10" fill="url(#bodyGrad)" />
    <ellipse cx="62" cy="85" rx="8" ry="10" fill="url(#bodyGrad)" />
  </g>
);

// Dark glass visor band across the eyes, with a soft glow halo and a glossy streak.
// dim = true for sleeping (visor looks "powered down")
const Visor = ({ dim = false }) => (
  <>
    <ellipse cx="50" cy="46" rx="24" ry="14" fill="url(#visorHalo)" opacity={dim ? 0.15 : 1} />
    <rect x="28" y="37" width="44" height="19" rx="9.5" fill={DARK} opacity={dim ? 0.55 : 0.94} />
    <path d="M32,40 L44,52" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.08" />
  </>
);

export const Tracky = ({ expression = 'happy', className = 'w-24 h-24' }) => {
  const floatVariants = {
    animate: {
      y: [0, -6, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const shakeVariants = {
    animate: {
      x: [0, -1, 1, -1, 1, 0],
      transition: { duration: 0.5, repeat: Infinity, repeatType: 'reverse' },
    },
  };

  const sleepVariants = {
    animate: {
      scale: [1, 1.03, 1],
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const renderExpression = () => {
    switch (expression) {
      case 'waving':
        // "Application sent" moment: he holds up a little resume, tosses it
        // off as a paper airplane, and a green success check lands once it's
        // away — the core beat of an internship tracker: you applied.
        return (
          <motion.svg
            viewBox="0 0 100 100"
            className={className}
            variants={floatVariants}
            animate="animate"
            aria-label="Tracky sends off an application"
          >
            <Defs />
            <Body />

            {/* resting arm */}
            <path d="M22,58 Q14,64 22,70" strokeWidth="6" strokeLinecap="round" stroke="url(#bodyGrad)" fill="none" />

            {/* raised arm: holds the resume, then flicks it off in a toss */}
            <motion.g
              style={{ originX: '78px', originY: '58px' }}
              animate={{ rotate: [0, -16, 6, 0] }}
              transition={{ duration: 1, delay: 0.3, times: [0, 0.45, 0.75, 1], ease: 'easeInOut' }}
            >
              <path d="M78,58 Q88,52 82,38" strokeWidth="6" strokeLinecap="round" stroke="url(#bodyGrad)" fill="none" />

              {/* resume card, visible in-hand before the toss */}
              <motion.g
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.8] }}
                transition={{ duration: 0.85, delay: 0.2, times: [0, 0.3, 0.65, 1] }}
              >
                <rect x="74" y="24" width="14" height="18" rx="2" fill="#f2f8f9" stroke="#bcd8de" strokeWidth="1" />
                <line x1="77" y1="29" x2="85" y2="29" stroke="#8ab0ba" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="77" y1="33" x2="85" y2="33" stroke="#8ab0ba" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="77" y1="37" x2="82" y2="37" stroke="#8ab0ba" strokeWidth="1.4" strokeLinecap="round" />
              </motion.g>

              {/* the same resume, now a paper airplane, launching off */}
              <motion.path
                d="M81,33 L92,29 L83,26 L84,31 Z"
                fill={GLOW}
                initial={{ opacity: 0, x: 0, y: 0, rotate: -10 }}
                animate={{ opacity: [0, 1, 1, 0], x: [0, 10, 26], y: [0, -10, -26], rotate: [-10, -18, -22] }}
                transition={{ duration: 0.85, delay: 0.5, times: [0, 0.2, 0.65, 1], ease: 'easeOut' }}
              />
            </motion.g>

            <Visor />
            <path d="M38,45 Q44,38 50,45" strokeWidth="3.5" strokeLinecap="round" stroke={GLOW} fill="none" />
            <path d="M54,45 Q60,38 66,45" strokeWidth="3.5" strokeLinecap="round" stroke={GLOW} fill="none" />

            <path d="M44,53 Q50,59 56,53" strokeWidth="2.5" strokeLinecap="round" stroke={DARK} fill="none" />
            <circle cx="34" cy="53" r="3" fill={BLUSH} opacity="0.5" />

            {/* success check badge lands once the plane is away */}
            <motion.g
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 1.2, ease: 'backOut' }}
            >
              <circle cx="70" cy="66" r="10" fill={SUCCESS} />
              <path d="M65,66 L69,70 L76,61" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </motion.g>
          </motion.svg>
        );

      case 'happy':
        return (
          <motion.svg
            viewBox="0 0 100 100"
            className={className}
            variants={floatVariants}
            animate="animate"
            aria-label="Tracky happy"
          >
            <Defs />
            <Body />

            <path d="M22,58 Q14,64 22,70" strokeWidth="6" strokeLinecap="round" stroke="url(#bodyGrad)" fill="none" />
            <path d="M78,58 Q86,64 78,70" strokeWidth="6" strokeLinecap="round" stroke="url(#bodyGrad)" fill="none" />

            <Visor />
            <path d="M38,45 Q44,38 50,45" strokeWidth="3.5" strokeLinecap="round" stroke={GLOW} fill="none" />
            <path d="M54,45 Q60,38 66,45" strokeWidth="3.5" strokeLinecap="round" stroke={GLOW} fill="none" />

            <circle cx="34" cy="52" r="3.5" fill={BLUSH} opacity="0.6" />
            <circle cx="68" cy="52" r="3.5" fill={BLUSH} opacity="0.6" />

            <path d="M44,52 Q50,60 56,52" fill={DARK} />
          </motion.svg>
        );

      case 'thinking':
        return (
          <motion.svg
            viewBox="0 0 100 100"
            className={className}
            variants={floatVariants}
            animate="animate"
            aria-label="Tracky thinking"
          >
            <Defs />
            <Body />

            <motion.path
              d="M22,58 Q25,38 35,42"
              strokeWidth="6"
              strokeLinecap="round"
              stroke="url(#bodyGrad)"
              fill="none"
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <path d="M78,58 Q86,64 78,70" strokeWidth="6" strokeLinecap="round" stroke="url(#bodyGrad)" fill="none" />

            <Visor />
            <circle cx="43" cy="45" r="3.4" fill={GLOW} />
            <circle cx="61" cy="46" r="2.6" fill={GLOW} />

            <circle cx="34" cy="52" r="2" fill={BLUSH} opacity="0.35" />
            <circle cx="68" cy="52" r="2" fill={BLUSH} opacity="0.35" />

            <path d="M46,55 Q50,52 54,55" strokeWidth="2.5" strokeLinecap="round" stroke={DARK} fill="none" />

            <motion.text
              x="72"
              y="23"
              fill={ACCENT}
              fontSize="16"
              fontWeight="bold"
              fontFamily="Space Grotesk, sans-serif"
              animate={{ y: [0, -4, 0], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ?
            </motion.text>
          </motion.svg>
        );

      case 'sleeping':
        return (
          <motion.svg
            viewBox="0 0 100 100"
            className={className}
            variants={sleepVariants}
            animate="animate"
            aria-label="Tracky sleeping"
          >
            <Defs />
            <Body opacity={0.9} />

            <path d="M22,62 Q30,68 38,62" strokeWidth="5.5" strokeLinecap="round" stroke="#8fa8b0" fill="none" opacity="0.8" />
            <path d="M78,62 Q70,68 62,62" strokeWidth="5.5" strokeLinecap="round" stroke="#8fa8b0" fill="none" opacity="0.8" />

            <Visor dim />
            <path d="M38,48 L46,48" strokeWidth="3" strokeLinecap="round" stroke="#6b8790" fill="none" opacity="0.8" />
            <path d="M54,48 L62,48" strokeWidth="3" strokeLinecap="round" stroke="#6b8790" fill="none" opacity="0.8" />

            <motion.text
              x="75"
              y="32"
              fill="#477082"
              fontSize="10"
              fontWeight="bold"
              animate={{ y: [0, -6, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: 0 }}
            >
              z
            </motion.text>
            <motion.text
              x="81"
              y="22"
              fill="#477082"
              fontSize="14"
              fontWeight="bold"
              animate={{ y: [0, -8, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: 1 }}
            >
              Z
            </motion.text>
          </motion.svg>
        );

      case 'celebrating':
        return (
          <motion.svg
            viewBox="0 0 100 100"
            className={className}
            variants={floatVariants}
            animate="animate"
            aria-label="Tracky celebrating"
          >
            <Defs />

            <polygon points="50,10 40,28 60,28" fill="#477082" />
            <circle cx="50" cy="9" r="3.5" fill={ACCENT} />

            <Body />

            <path d="M22,58 Q12,45 16,39" strokeWidth="6" strokeLinecap="round" stroke="url(#bodyGrad)" fill="none" />
            <path d="M78,58 Q88,45 84,39" strokeWidth="6" strokeLinecap="round" stroke="url(#bodyGrad)" fill="none" />

            <Visor />
            <path d="M38,51 Q44,45 50,51" strokeWidth="3" strokeLinecap="round" stroke={GLOW} fill="none" />
            <path d="M54,51 Q60,45 66,51" strokeWidth="3" strokeLinecap="round" stroke={GLOW} fill="none" />

            <ellipse cx="50" cy="60" rx="6" ry="4" fill={DARK} />

            <motion.circle cx="20" cy="25" r="2" fill={ACCENT} animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} />
            <motion.rect x="75" y="30" width="3" height="3" fill="#477082" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} />
          </motion.svg>
        );

      case 'sad':
        return (
          <motion.svg
            viewBox="0 0 100 100"
            className={className}
            variants={shakeVariants}
            animate="animate"
            aria-label="Tracky sad"
          >
            <Defs />
            <Body />

            <path d="M22,60 Q15,72 20,78" strokeWidth="6" strokeLinecap="round" stroke="#8fa8b0" fill="none" />
            <path d="M78,60 Q85,72 80,78" strokeWidth="6" strokeLinecap="round" stroke="#8fa8b0" fill="none" />

            <Visor />
            <path d="M38,48 Q42,50 46,47" strokeWidth="3.5" strokeLinecap="round" stroke={GLOW} fill="none" opacity="0.75" />
            <path d="M54,47 Q58,50 62,48" strokeWidth="3.5" strokeLinecap="round" stroke={GLOW} fill="none" opacity="0.75" />

            <motion.path
              d="M40,51 L40,58"
              strokeWidth="2"
              stroke="#5ba8c9"
              fill="none"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            <motion.path
              d="M60,51 L60,58"
              strokeWidth="2"
              stroke="#5ba8c9"
              fill="none"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
            />

            <path d="M46,57 Q50,53 54,57" strokeWidth="2.5" strokeLinecap="round" stroke={DARK} fill="none" />
          </motion.svg>
        );

      case 'excited':
        return (
          <motion.svg
            viewBox="0 0 100 100"
            className={className}
            animate={{ scale: [1, 1.05, 1], y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
            aria-label="Tracky excited"
          >
            <Defs />
            <Body />

            <path d="M22,55 Q10,50 18,42" strokeWidth="6" strokeLinecap="round" stroke="url(#bodyGrad)" fill="none" />
            <path d="M78,55 Q90,50 82,42" strokeWidth="6" strokeLinecap="round" stroke="url(#bodyGrad)" fill="none" />

            <Visor />
            <polygon points="40,38 42,43 47,43 43,46 45,51 40,48 35,51 37,46 33,43 38,43" fill={GLOW} />
            <polygon points="60,38 62,43 67,43 63,46 65,51 60,48 55,51 57,46 53,43 58,43" fill={GLOW} />

            <circle cx="34" cy="52" r="4.5" fill={BLUSH} opacity="0.7" />
            <circle cx="68" cy="52" r="4.5" fill={BLUSH} opacity="0.7" />

            <ellipse cx="50" cy="55" rx="7" ry="5" fill={DARK} />
            <path d="M45,55 Q50,60 55,55" fill={ACCENT} />
          </motion.svg>
        );

      case 'confused':
        return (
          <motion.svg
            viewBox="0 0 100 100"
            className={className}
            variants={floatVariants}
            animate="animate"
            aria-label="Tracky confused"
          >
            <Defs />
            <Body />

            <path d="M22,60 Q18,72 24,78" strokeWidth="6" strokeLinecap="round" stroke="url(#bodyGrad)" fill="none" />
            <path d="M78,58 Q85,45 80,40" strokeWidth="6" strokeLinecap="round" stroke="url(#bodyGrad)" fill="none" />

            <Visor />
            <circle cx="40" cy="45" r="4" fill={GLOW} />
            <circle cx="60" cy="45" r="2.2" fill={GLOW} />

            <circle cx="34" cy="53" r="2" fill={BLUSH} opacity="0.35" />
            <circle cx="66" cy="53" r="2" fill={BLUSH} opacity="0.35" />

            <path d="M44,55 Q47,52 50,55 T56,55" strokeWidth="2.5" strokeLinecap="round" stroke={DARK} fill="none" />

            <motion.path
              d="M72,25 Q70,20 72,15"
              strokeWidth="2"
              strokeLinecap="round"
              stroke="#5ba8c9"
              fill="none"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.svg>
        );

      case 'loading':
      default:
        return (
          <motion.svg
            viewBox="0 0 100 100"
            className={className}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            aria-label="Tracky loading"
          >
            <Defs />
            <rect x="20" y="20" width="60" height="60" rx="30" ry="30" fill="none" strokeWidth="6" stroke="#e2e8ea" />
            <motion.rect
              x="20"
              y="20"
              width="60"
              height="60"
              rx="30"
              ry="30"
              fill="none"
              strokeWidth="6"
              stroke="#477082"
              strokeDasharray="240"
              strokeDashoffset="140"
            />
            <rect x="42" y="42" width="16" height="16" rx="6" ry="6" fill="url(#bodyGrad)" />
          </motion.svg>
        );
    }
  };

  return <div className="flex items-center justify-center">{renderExpression()}</div>;
};

export default Tracky;
