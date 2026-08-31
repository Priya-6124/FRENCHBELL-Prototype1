import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { playSplashSound, playPopSound } from '../utils/audio';

const FOOD_EMOJIS = [
  { id: 'burger', emoji: '🍔', name: 'Burger', title: 'Juicy Zinger', x: -145, y: -80, rot: -14, scale: 1.15, floatDelay: 0, floatDuration: 2.4, phrase: 'Juicy Bite! 🍔' },
  { id: 'fries', emoji: '🍟', name: 'Fries', title: 'Peri Peri Crispy', x: 145, y: -85, rot: 16, scale: 1.15, floatDelay: 0.2, floatDuration: 2.7, phrase: 'Extra Crispy! 🍟' },
  { id: 'momos', emoji: '🥟', name: 'Momos', title: 'Steamed & Fried', x: -160, y: 75, rot: 12, scale: 1.1, floatDelay: 0.5, floatDuration: 2.2, phrase: 'Steamed Dip! 🥟' },
  { id: 'strips', emoji: '🍗', name: 'Strips', title: 'Golden Crunch', x: 160, y: 80, rot: -12, scale: 1.1, floatDelay: 0.3, floatDuration: 2.5, phrase: 'Golden Crunch! 🍗' },
  { id: 'sandwich', emoji: '🥪', name: 'Sandwich', title: 'Grilled Club', x: -95, y: -165, rot: -10, scale: 1.05, floatDelay: 0.6, floatDuration: 2.8, phrase: 'Triple Grilled! 🥪' },
  { id: 'roll', emoji: '🌯', name: 'Roll', title: 'Kathi & Shawarma', x: 95, y: -165, rot: 14, scale: 1.05, floatDelay: 0.4, floatDuration: 2.3, phrase: 'Loaded Wrap! 🌯' },
  { id: 'cheese', emoji: '🧀', name: 'Cheese', title: 'Molten Dip', x: -185, y: -6, rot: 22, scale: 0.98, floatDelay: 0.7, floatDuration: 2.1, phrase: 'Cheesy Melt! 🧀' },
  { id: 'coffee', emoji: '☕', name: 'Coffee', title: 'Freshly Brewed', x: 185, y: -6, rot: -18, scale: 1.02, floatDelay: 0.1, floatDuration: 2.9, phrase: 'Rich Aroma! ☕' },
  { id: 'boba', emoji: '🧋', name: 'Boba', title: 'Sweet Pearls', x: -110, y: 165, rot: -14, scale: 1.0, floatDelay: 0.8, floatDuration: 2.4, phrase: 'Sweet Sips! 🧋' },
  { id: 'pizza', emoji: '🍕', name: 'Pizza', title: 'Loaded Slice', x: 110, y: 165, rot: 15, scale: 1.0, floatDelay: 0.9, floatDuration: 2.6, phrase: 'Molten Pull! 🍕' },
  { id: 'croissant', emoji: '🥐', name: 'Croissant', title: 'Flaky Butter', x: 0, y: -215, rot: 0, scale: 1.1, floatDelay: 0.15, floatDuration: 2.0, phrase: 'Flaky French! 🥐' },
  { id: 'donut', emoji: '🍩', name: 'Donut', title: 'Glazed Ring', x: 0, y: 220, rot: -8, scale: 1.0, floatDelay: 0.35, floatDuration: 2.6, phrase: 'Sweet Glaze! 🍩' },
];

export default function SplashScreen({ onComplete }) {
  const [stage, setStage] = useState(0);
  const [poppedMap, setPoppedMap] = useState({});
  const [activeFloaters, setActiveFloaters] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    // Stage choreography
    const t1 = setTimeout(() => {
      setStage(1);
      playSplashSound();
    }, 200);

    const t2 = setTimeout(() => {
      setStage(2);
    }, 850);

    const t3 = setTimeout(() => {
      setStage(3);
    }, 2000);

    const t4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const handleEmojiClick = (e, item) => {
    e.stopPropagation();
    
    // Play interactive pop audio sound
    playPopSound();

    // Trigger colorful mini confetti burst
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 24,
      spread: 60,
      origin: { x, y },
      colors: ['#D4AF37', '#E5BF45', '#FFFDF9', '#E07A5F', '#2E7D32'],
      disableForReducedMotion: true,
      scalar: 0.8
    });

    // Mark as popped & trigger spin bounce
    setPoppedMap(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));

    // Spawn floating feedback message
    const newFloater = {
      id: Date.now() + Math.random(),
      text: item.phrase,
      x: item.x,
      y: item.y - 20
    };
    setActiveFloaters(prev => [...prev.slice(-4), newFloater]);

    setTimeout(() => {
      setActiveFloaters(prev => prev.filter(f => f.id !== newFloater.id));
    }, 1200);
  };

  const totalPopped = Object.values(poppedMap).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.55, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] bg-[#120703] flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden"
    >
      {/* ================= BACKGROUND TEXTURES & LUXURY AMBIENCE ================= */}
      
      {/* 1. Deep Roasted Espresso French Cafe Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1F0E07] via-[#140804] to-[#0A0301] pointer-events-none" />

      {/* 2. Tactile Canvas & Paper Grain SVG Filter Texture */}
      <svg className="absolute inset-0 w-full h-full opacity-25 mix-blend-overlay pointer-events-none">
        <filter id="cafeNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.35 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cafeNoise)" />
      </svg>

      {/* 3. Parisian Bistro Golden Lattice / Geometric Polka Tile Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.22]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 12px 12px, rgba(212, 175, 55, 0.45) 1.5px, transparent 1.5px),
            radial-gradient(circle at 36px 36px, rgba(212, 175, 55, 0.25) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* 4. Elegant Diagonal Bistro Crosshatch Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, rgba(212, 175, 55, 0.3) 0, rgba(212, 175, 55, 0.3) 1px, transparent 0, transparent 20px)`
        }}
      />

      {/* 5. Central Golden Halo & Warm Amber Glow Stage */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-french-gold/25 via-amber-500/15 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />
      
      {/* 6. Soft Dark Vignette Framing */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,2,1,0.85)_100%)] pointer-events-none" />

      {/* 7. Floating Golden Dust, Shimmer Sparks & Steam Swirls */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              y: 250,
              x: (i * 50) - 375
            }}
            animate={{
              opacity: [0, 0.8, 0],
              y: [-80, -500],
              x: [(i * 50) - 375, (i * 50) - 375 + (i % 2 === 0 ? 35 : -35)],
              scale: [0.5, 1.5, 0.4]
            }}
            transition={{
              duration: 3.2 + (i % 3) * 0.9,
              repeat: Infinity,
              delay: (i * 0.2),
              ease: "easeInOut"
            }}
            className="absolute bottom-12 left-1/2 w-2.5 h-2.5 bg-gradient-to-tr from-french-gold via-yellow-200 to-amber-400 rounded-full blur-[0.8px] shadow-[0_0_10px_rgba(212,175,55,0.9)]"
          />
        ))}
      </div>

      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 px-4 py-2 rounded-full border border-french-gold/40 bg-french-dark/85 text-french-gold text-xs font-black uppercase tracking-wider hover:bg-french-gold hover:text-french-dark hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-md z-30 shadow-lg gold-glow cursor-pointer"
      >
        Skip ➔
      </button>

      {/* ================= DYNAMIC FOOD EMOJIS WITH FUN PHYSICS & INTERACTIONS ================= */}
      <AnimatePresence>
        {stage >= 1 && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {FOOD_EMOJIS.map((item, idx) => {
              const clickCount = poppedMap[item.id] || 0;
              return (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: -30 }}
                  animate={{
                    scale: [0, item.scale * 1.45, item.scale],
                    opacity: [0, 1, 0.98],
                    x: item.x,
                    y: [
                      item.y,
                      item.y - 15,
                      item.y + 12,
                      item.y
                    ],
                    rotate: [
                      -30,
                      item.rot > 0 ? item.rot + 20 : item.rot - 20,
                      item.rot
                    ]
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 13,
                    delay: idx * 0.04,
                    y: {
                      repeat: Infinity,
                      duration: item.floatDuration,
                      ease: "easeInOut",
                      delay: item.floatDelay
                    },
                    rotate: {
                      repeat: Infinity,
                      repeatType: "mirror",
                      duration: item.floatDuration * 1.3,
                      ease: "easeInOut",
                      delay: item.floatDelay
                    }
                  }}
                  whileHover={{
                    scale: item.scale * 1.35,
                    rotate: item.rot + (item.rot > 0 ? 12 : -12),
                    zIndex: 40,
                    transition: { type: "spring", stiffness: 450, damping: 14 }
                  }}
                  whileTap={{
                    scale: item.scale * 0.85,
                    rotate: item.rot + 360,
                    transition: { duration: 0.3 }
                  }}
                  className="absolute pointer-events-auto cursor-pointer group"
                  onClick={(e) => handleEmojiClick(e, item)}
                  title={`Tap to pop ${item.name}!`}
                >
                  {/* Floating Glowing Emoji Card */}
                  <div className="relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#33190E]/95 via-[#230F07]/95 to-[#150702]/95 border-2 border-french-gold/40 shadow-[0_10px_25px_rgba(0,0,0,0.7)] backdrop-blur-md transform transition-all duration-200 group-hover:border-french-gold group-hover:shadow-[0_0_25px_rgba(212,175,55,0.6)]">
                    
                    {/* Floating Emoji Symbol with 3D shadow and playful wiggle */}
                    <motion.span
                      animate={clickCount > 0 ? {
                        rotate: [0, -25, 25, -15, 15, 0],
                        scale: [1, 1.4, 1]
                      } : {}}
                      transition={{ duration: 0.4 }}
                      className="text-3xl sm:text-4xl filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.8)] group-hover:scale-125 transition-transform duration-200 select-none block"
                    >
                      {item.emoji}
                    </motion.span>

                    {/* Pop Count Badge (If tapped) */}
                    {clickCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-french-gold text-french-dark text-[10px] font-black flex items-center justify-center shadow-md border border-white/50"
                      >
                        +{clickCount}
                      </motion.div>
                    )}

                    {/* Golden Edge Shimmer */}
                    <div className="absolute inset-0 rounded-2xl border border-french-gold/20 pointer-events-none group-hover:border-french-gold/70 transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Floating Reaction Messages */}
      <AnimatePresence>
        {activeFloaters.map(f => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: f.y + 10, scale: 0.7 }}
            animate={{ opacity: 1, y: f.y - 35, scale: 1.15 }}
            exit={{ opacity: 0, y: f.y - 65, scale: 0.9 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="absolute z-50 pointer-events-none px-3 py-1 rounded-full bg-french-gold text-french-dark font-black text-xs shadow-2xl border border-yellow-100 flex items-center gap-1"
          >
            {f.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ================= CENTER BRAND & BELL ELEMENT ================= */}
      <div className="relative z-10 flex flex-col items-center max-w-sm">
        
        {/* Animated Bell & Logo Container */}
        <motion.div
          animate={stage >= 1 ? {
            rotate: [0, -28, 28, -20, 20, -12, 12, -5, 5, 0],
            scale: [0.9, 1.14, 1]
          } : {}}
          transition={{ duration: 1.3, ease: "easeInOut" }}
          className="relative mb-5"
        >
          {/* Outer Golden Glow Ring */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-french-gold via-[#F2CE6B] to-[#8C6F1E] p-1.5 shadow-[0_0_55px_rgba(212,175,55,0.65)] gold-glow flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#1A0A04] flex items-center justify-center p-3 overflow-hidden border-2 border-french-gold/40">
              <img
                src="/assets/logo.jfif"
                alt="French Bell Logo"
                className="w-full h-full object-contain rounded-full shadow-inner"
              />
            </div>
          </div>

          {/* Concentric Golden Soundwaves */}
          {stage >= 1 && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0.95 }}
                animate={{ scale: 2.3, opacity: 0 }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border-2 border-french-gold pointer-events-none"
              />
              <motion.div
                initial={{ scale: 0.6, opacity: 0.8 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
                className="absolute inset-0 rounded-full border-2 border-french-gold pointer-events-none"
              />
            </>
          )}
        </motion.div>

        {/* Fun DING! Audio Burst Headline */}
        <AnimatePresence>
          {stage >= 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 14 }}
              animate={{
                scale: [0, 1.35, 0.95, 1.08, 1],
                opacity: 1,
                y: 0
              }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 15
              }}
              className="font-handwriting text-5xl sm:text-6xl text-french-gold font-black drop-shadow-[0_4px_22px_rgba(212,175,55,0.95)] tracking-wide mb-2 flex items-center gap-2"
            >
              <span>DING!</span>
              <motion.span
                animate={{ rotate: [-18, 18, -18] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              >
                🔔
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cafe Title & Fun Catchphrase with Emojis */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col items-center space-y-2.5"
        >
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-french-cream via-[#F5E2AC] to-french-gold tracking-widest uppercase drop-shadow">
            FRENCH BELL
          </h1>

          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-french-gold/25 via-french-gold/15 to-french-gold/25 border border-french-gold/40 shadow-inner">
            <span className="text-xs sm:text-sm font-black text-french-gold tracking-wide">
              Crave • Tap • Enjoy 🍔🍟✨
            </span>
          </div>

          {/* Interactive Flavor Popping Guide */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ delay: 0.8 }}
            className="text-[11px] sm:text-xs text-french-gold/80 font-medium tracking-wide flex items-center gap-1.5 mt-2"
          >
            <span>💡 Tap emojis to pop cravings!</span>
            {totalPopped > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-french-gold/30 text-french-gold font-bold text-[10px] border border-french-gold/40">
                {totalPopped} popped 🎉
              </span>
            )}
          </motion.p>
        </motion.div>

      </div>
    </motion.div>
  );
}
