import React from 'react';
import { motion } from 'framer-motion';

export const Tracky = ({ expression = 'happy', className = 'w-24 h-24' }) => {
  // Common variants
  const floatVariants = {
    animate: {
      y: [0, -6, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const shakeVariants = {
    animate: {
      x: [0, -1, 1, -1, 1, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
  };

  const sleepVariants = {
    animate: {
      scale: [1, 1.03, 1],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const renderExpression = () => {
    switch (expression) {
      case 'waving':
        return (
          <motion.svg
            viewBox="0 0 100 100"
            className={className}
            variants={floatVariants}
            animate="animate"
            aria-label="Tracky waving"
          >
            {/* Body */}
            <circle cx="50" cy="55" r="30" className="fill-primary-500" />
            <circle cx="50" cy="58" r="20" className="fill-secondary-200" />
            
            {/* Feet */}
            <ellipse cx="38" cy="83" rx="8" ry="4" className="fill-primary-600" />
            <ellipse cx="62" cy="83" rx="8" ry="4" className="fill-primary-600" />
            
            {/* Left Arm (idle) */}
            <path d="M22,58 Q15,62 20,68" strokeWidth="6" strokeLinecap="round" className="stroke-primary-500 fill-none" />
            
            {/* Right Arm (waving) */}
            <motion.path
              d="M78,55 Q85,42 90,48"
              strokeWidth="6"
              strokeLinecap="round"
              className="stroke-primary-500 fill-none"
              animate={{ rotate: [0, -25, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              style={{ originX: '78px', originY: '55px' }}
            />

            {/* Eyes (Happy arcs) */}
            <path d="M40,48 Q45,43 50,48" strokeWidth="3" strokeLinecap="round" className="stroke-white fill-none" />
            <path d="M56,48 Q61,43 66,48" strokeWidth="3" strokeLinecap="round" className="stroke-white fill-none" />

            {/* Rosy Cheeks */}
            <circle cx="34" cy="53" r="3" className="fill-rose-300 opacity-60" />
            <circle cx="68" cy="53" r="3" className="fill-rose-300 opacity-60" />

            {/* Mouth */}
            <path d="M47,54 Q50,57 53,54" strokeWidth="2.5" strokeLinecap="round" className="stroke-white fill-none" />
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
            <circle cx="50" cy="55" r="30" className="fill-primary-500" />
            <circle cx="50" cy="58" r="20" className="fill-secondary-200" />
            
            <ellipse cx="38" cy="83" rx="8" ry="4" className="fill-primary-600" />
            <ellipse cx="62" cy="83" rx="8" ry="4" className="fill-primary-600" />
            
            {/* Arms */}
            <path d="M22,58 Q14,64 22,70" strokeWidth="6" strokeLinecap="round" className="stroke-primary-500 fill-none" />
            <path d="M78,58 Q86,64 78,70" strokeWidth="6" strokeLinecap="round" className="stroke-primary-500 fill-none" />

            {/* Eyes (Happy curves) */}
            <path d="M38,45 Q44,38 50,45" strokeWidth="3.5" strokeLinecap="round" className="stroke-white fill-none" />
            <path d="M54,45 Q60,38 66,45" strokeWidth="3.5" strokeLinecap="round" className="stroke-white fill-none" />

            <circle cx="34" cy="52" r="3.5" className="fill-rose-300 opacity-70" />
            <circle cx="68" cy="52" r="3.5" className="fill-rose-300 opacity-70" />

            {/* Smiling Mouth */}
            <path d="M44,52 Q50,60 56,52" fill="white" className="stroke-primary-600" strokeWidth="1" />
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
            <circle cx="50" cy="55" r="30" className="fill-primary-500" />
            <circle cx="50" cy="58" r="20" className="fill-secondary-200" />
            
            <ellipse cx="38" cy="83" rx="8" ry="4" className="fill-primary-600" />
            <ellipse cx="62" cy="83" rx="8" ry="4" className="fill-primary-600" />
            
            {/* Left Arm (thinking scratch) */}
            <motion.path
              d="M22,58 Q25,38 35,42"
              strokeWidth="6"
              strokeLinecap="round"
              className="stroke-primary-500 fill-none"
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <path d="M78,58 Q86,64 78,70" strokeWidth="6" strokeLinecap="round" className="stroke-primary-500 fill-none" />

            {/* Eyes looking up/side */}
            <circle cx="43" cy="45" r="5" fill="white" />
            <circle cx="45" cy="45" r="2.5" fill="#333" />
            
            <circle cx="59" cy="45" r="5" fill="white" />
            <circle cx="61" cy="45" r="2.5" fill="#333" />

            <circle cx="34" cy="52" r="2" className="fill-rose-300 opacity-40" />
            <circle cx="68" cy="52" r="2" className="fill-rose-300 opacity-40" />

            {/* Mouth */}
            <path d="M46,55 Q50,52 54,55" strokeWidth="2.5" strokeLinecap="round" className="stroke-white fill-none" />

            {/* Floating Question Mark */}
            <motion.text
              x="70"
              y="25"
              fill="#F7D4C1"
              fontSize="16"
              fontWeight="bold"
              fontFamily="Outfit"
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
            <circle cx="50" cy="55" r="30" className="fill-primary-500 opacity-90" />
            <circle cx="50" cy="58" r="20" className="fill-secondary-200 opacity-90" />
            
            <ellipse cx="38" cy="83" rx="8" ry="4" className="fill-primary-600 opacity-90" />
            <ellipse cx="62" cy="83" rx="8" ry="4" className="fill-primary-600 opacity-90" />
            
            {/* Arms resting */}
            <path d="M22,62 Q30,68 38,62" strokeWidth="5.5" strokeLinecap="round" className="stroke-primary-600/70 fill-none" />
            <path d="M78,62 Q70,68 62,62" strokeWidth="5.5" strokeLinecap="round" className="stroke-primary-600/70 fill-none" />

            {/* Closed Eyes */}
            <path d="M38,48 L46,48" strokeWidth="3" strokeLinecap="round" className="stroke-gray-300 fill-none" />
            <path d="M54,48 L62,48" strokeWidth="3" strokeLinecap="round" className="stroke-gray-300 fill-none" />

            {/* Floating Zzz */}
            <motion.text
              x="75"
              y="32"
              fill="#3c91ac"
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
              fill="#3c91ac"
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
            {/* Party Hat */}
            <polygon points="50,10 40,28 60,28" className="fill-secondary-500" />
            <circle cx="50" cy="9" r="3.5" className="fill-yellow-400" />

            <circle cx="50" cy="58" r="30" className="fill-primary-500" />
            <circle cx="50" cy="61" r="20" className="fill-secondary-200" />
            
            <ellipse cx="38" cy="86" rx="8" ry="4" className="fill-primary-600" />
            <ellipse cx="62" cy="86" rx="8" ry="4" className="fill-primary-600" />
            
            {/* Arms raised */}
            <path d="M22,55 Q12,42 16,36" strokeWidth="6" strokeLinecap="round" className="stroke-primary-500 fill-none" />
            <path d="M78,55 Q88,42 84,36" strokeWidth="6" strokeLinecap="round" className="stroke-primary-500 fill-none" />

            {/* Happy eyes */}
            <path d="M38,48 Q44,42 50,48" strokeWidth="3" strokeLinecap="round" className="stroke-white fill-none" />
            <path d="M54,48 Q60,42 66,48" strokeWidth="3" strokeLinecap="round" className="stroke-white fill-none" />

            {/* Big Smiling Mouth */}
            <ellipse cx="50" cy="57" rx="6" ry="4" fill="white" />

            {/* Confetti particles */}
            <motion.circle cx="20" cy="25" r="2" fill="#F7D4C1" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} />
            <motion.rect x="75" y="30" width="3" height="3" fill="#3C91AC" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} />
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
            <circle cx="50" cy="55" r="30" className="fill-primary-600" />
            <circle cx="50" cy="58" r="20" className="fill-slate-200 dark:fill-slate-800" />
            
            <ellipse cx="38" cy="83" rx="8" ry="4" className="fill-primary-700" />
            <ellipse cx="62" cy="83" rx="8" ry="4" className="fill-primary-700" />
            
            {/* Arms down drooping */}
            <path d="M22,60 Q15,72 20,78" strokeWidth="6" strokeLinecap="round" className="stroke-primary-600 fill-none" />
            <path d="M78,60 Q85,72 80,78" strokeWidth="6" strokeLinecap="round" className="stroke-primary-600 fill-none" />

            {/* Drooping Eyes */}
            <path d="M38,48 Q42,50 46,47" strokeWidth="3.5" strokeLinecap="round" className="stroke-white fill-none" />
            <path d="M54,47 Q58,50 62,48" strokeWidth="3.5" strokeLinecap="round" className="stroke-white fill-none" />

            {/* Tears */}
            <motion.path
              d="M40,51 L40,58"
              strokeWidth="2"
              className="stroke-sky-400 fill-none"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            <motion.path
              d="M60,51 L60,58"
              strokeWidth="2"
              className="stroke-sky-400 fill-none"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
            />

            {/* Frowny Mouth */}
            <path d="M46,57 Q50,53 54,57" strokeWidth="2.5" strokeLinecap="round" className="stroke-white fill-none" />
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
            <circle cx="50" cy="55" r="30" className="fill-primary-500" />
            <circle cx="50" cy="58" r="20" className="fill-secondary-200" />
            
            <ellipse cx="38" cy="83" rx="8" ry="4" className="fill-primary-600" />
            <ellipse cx="62" cy="83" rx="8" ry="4" className="fill-primary-600" />
            
            {/* Arms out shaking */}
            <path d="M22,55 Q10,50 18,42" strokeWidth="6" strokeLinecap="round" className="stroke-primary-500 fill-none" />
            <path d="M78,55 Q90,50 82,42" strokeWidth="6" strokeLinecap="round" className="stroke-primary-500 fill-none" />

            {/* Sparkling eyes (star/polygon shape) */}
            <polygon points="40,38 42,43 47,43 43,46 45,51 40,48 35,51 37,46 33,43 38,43" fill="white" />
            <polygon points="60,38 62,43 67,43 63,46 65,51 60,48 55,51 57,46 53,43 58,43" fill="white" />

            <circle cx="34" cy="52" r="4.5" className="fill-rose-300 opacity-80" />
            <circle cx="68" cy="52" r="4.5" className="fill-rose-300 opacity-80" />

            {/* Big Open Mouth */}
            <ellipse cx="50" cy="55" rx="7" ry="5" fill="white" />
            <path d="M45,55 Q50,60 55,55" fill="#f43f5e" />
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
            <circle cx="50" cy="55" r="30" className="fill-primary-500" />
            <circle cx="50" cy="58" r="20" className="fill-secondary-200" />
            
            <ellipse cx="38" cy="83" rx="8" ry="4" className="fill-primary-600" />
            <ellipse cx="62" cy="83" rx="8" ry="4" className="fill-primary-600" />
            
            {/* Arms: one up, one down */}
            <path d="M22,60 Q18,72 24,78" strokeWidth="6" strokeLinecap="round" className="stroke-primary-500 fill-none" />
            <path d="M78,58 Q85,45 80,40" strokeWidth="6" strokeLinecap="round" className="stroke-primary-500 fill-none" />

            {/* Unequal/Confused Eyes */}
            <circle cx="40" cy="45" r="6" fill="white" />
            <circle cx="40" cy="45" r="2" fill="#333" />
            
            <circle cx="60" cy="45" r="3.5" fill="white" />
            <circle cx="60" cy="45" r="1.2" fill="#333" />

            <circle cx="34" cy="53" r="2" className="fill-rose-300 opacity-40" />
            <circle cx="66" cy="53" r="2" className="fill-rose-300 opacity-40" />

            {/* Squiggly Mouth */}
            <path d="M44,55 Q47,52 50,55 T56,55" strokeWidth="2.5" strokeLinecap="round" className="stroke-white fill-none" />

            {/* Floating question mark / sweat drop */}
            <motion.path
              d="M72,25 Q70,20 72,15"
              strokeWidth="2"
              strokeLinecap="round"
              className="stroke-sky-300 fill-none"
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
            {/* Ring body */}
            <circle cx="50" cy="50" r="30" fill="none" strokeWidth="6" className="stroke-gray-200 dark:stroke-gray-800" />
            <circle
              cx="50"
              cy="50"
              r="30"
              fill="none"
              strokeWidth="6"
              className="stroke-primary-500"
              strokeDasharray="188.4"
              strokeDashoffset="120"
            />
            {/* Small tracking core */}
            <circle cx="50" cy="50" r="10" className="fill-secondary-200" />
          </motion.svg>
        );
    }
  };

  return <div className="flex items-center justify-center">{renderExpression()}</div>;
};
export default Tracky;
