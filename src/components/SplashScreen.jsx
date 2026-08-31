import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSplashSound } from '../utils/audio';

const FOOD_EMOJIS = [
  { emoji: '🍔', label: 'Burger', x: -140, y: -70, rot: -15, scale: 1.1, delay: 0.1 },
  { emoji: '🍟', label: 'Fries', x: 140, y: -80, rot: 18, scale: 1.1, delay: 0.15 },
  { emoji: '🥟', label: 'Momos', x: -160, y: 70, rot: 12, scale: 1.05, delay: 0.2 },
  { emoji: '🍗', label: 'Strips', x: 150, y: 80, rot: -10, scale: 1.05, delay: 0.25 },
  { emoji: '🥪', label: 'Sandwich', x: -90, y: -150, rot: -8, scale: 0.95, delay: 0.3 },
  { emoji: '🌯', label: 'Roll', x: 90, y: -150, rot: 15, scale: 0.95, delay: 0.35 },
  { emoji: '🧀', label: 'Cheese', x: -170, y: -5, rot: 25, scale: 0.9, delay: 0.4 },
  { emoji: '☕', label: 'Coffee', x: 170, y: -5, rot: -20, scale: 0.95, delay: 0.45 },
  { emoji: '🧋', label: 'Boba', x: -110, y: 150, rot: -12, scale: 0.9, delay: 0.5 },
  { emoji: '✨', label: 'Sparkle', x: 110, y: 150, rot: 10, scale: 1, delay: 0.55 },
];

export default function SplashScreen({ onComplete }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage sequence
    const t1 = setTimeout(() => {
      setStage(1);
      playSplashSound();
    }, 300);

    const t2 = setTimeout(() => {
      setStage(2);
    }, 900);

    const t3 = setTimeout(() => {
      setStage(3);
    }, 1800);

    const t4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[100] bg-gradient-to-br from-[#1A0F0A] via-[#2B150A] to-[#120804] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
    >
      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 px-4 py-2 rounded-full border border-french-gold/30 bg-french-dark/80 text-french-gold text-xs font-extrabold uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all duration-300 backdrop-blur-md z-30"
      >
        Skip ➔
      </button>

      {/* Ambient Steam & Glow Particles */}
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: [0, 0.35, 0],
              scale: [0.8, 1.4, 2],
              y: [-10, -120],
              x: [i % 2 === 0 ? -25 : 25, i % 2 === 0 ? 25 : -25]
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeOut"
            }}
            className="absolute w-20 h-28 bg-gradient-to-t from-french-gold/25 via-amber-500/10 to-transparent rounded-full blur-2xl"
          />
        ))}
      </div>

      {/* Floating Animated Popping Food Emojis */}
      <AnimatePresence>
        {stage >= 1 && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {FOOD_EMOJIS.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, item.scale * 1.3, item.scale],
                  opacity: [0, 1, 0.95],
                  x: item.x,
                  y: [item.y + 10, item.y - 10, item.y],
                  rotate: [0, item.rot * 1.5, item.rot]
                }}
                transition={{
                  type: 'spring',
                  stiffness: 180,
                  damping: 12,
                  delay: item.delay,
                  y: {
                    repeat: Infinity,
                    repeatType: 'reverse',
                    duration: 1.8 + (idx % 3) * 0.4,
                    ease: 'easeInOut'
                  }
                }}
                className="absolute flex p-2.5 sm:p-3 rounded-2xl bg-french-brown/85 border border-french-gold/40 shadow-2xl backdrop-blur-md items-center justify-center"
              >
                <span className="text-3xl sm:text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                  {item.emoji}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Center Brand & Ringing Bell Element */}
      <div className="relative z-10 flex flex-col items-center max-w-sm">
        {/* Animated Bell / Logo Container */}
        <motion.div
          animate={stage >= 1 ? { rotate: [0, -22, 22, -14, 14, -6, 6, 0] } : {}}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          className="relative mb-5"
        >
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-french-gold via-[#E2BA4B] to-[#9E8024] p-1.5 shadow-[0_0_40px_rgba(212,175,55,0.4)] gold-glow flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-french-dark flex items-center justify-center p-2.5 overflow-hidden">
              <img
                src="/assets/logo.jfif"
                alt="French Bell Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>

          {/* Sound Ripples */}
          {stage >= 1 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-french-gold pointer-events-none"
            />
          )}
        </motion.div>

        {/* Fun DING! Burst */}
        <AnimatePresence>
          {stage >= 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 10 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 16 }}
              className="font-handwriting text-5xl sm:text-6xl text-french-gold font-extrabold drop-shadow-[0_4px_16px_rgba(212,175,55,0.9)] tracking-wide mb-2"
            >
              DING! 🔔
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cafe Title & Fun Catchphrase with Emojis */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center space-y-2"
        >
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-french-cream via-[#F4DE9C] to-french-gold tracking-wider uppercase">
            FRENCH BELL
          </h1>

          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-french-gold/15 border border-french-gold/30">
            <span className="text-xs sm:text-sm font-extrabold text-french-gold tracking-wide">
              Crave • Tap • Enjoy 🍔✨
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
