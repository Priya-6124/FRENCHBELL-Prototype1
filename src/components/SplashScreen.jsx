import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playBellDing } from '../utils/audio';

export default function SplashScreen({ onComplete }) {
  const [stage, setStage] = useState(0); // 0: Logo fade in, 1: Bell swing & DING, 2: Steam & floating food, 3: "Your cravings just walked in", 4: Fade out

  useEffect(() => {
    // Stage sequence
    const timer1 = setTimeout(() => {
      setStage(1);
      playBellDing();
    }, 400);

    const timer2 = setTimeout(() => {
      setStage(2);
    }, 1200);

    const timer3 = setTimeout(() => {
      setStage(3);
    }, 2000);

    const timer4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
      className="fixed inset-0 z-[100] bg-gradient-to-br from-french-dark via-[#27150C] to-french-brown flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
    >
      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 px-4 py-2 rounded-full border border-french-gold/30 bg-french-dark/60 text-french-gold text-xs font-semibold uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all duration-300 backdrop-blur-md"
      >
        Skip Intro ➔
      </button>

      {/* Floating Coffee Steam Effect */}
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0, 0.4, 0],
              y: [-20, -100],
              x: [i % 2 === 0 ? -15 : 15, i % 2 === 0 ? 15 : -15]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut"
            }}
            className="absolute w-12 h-24 bg-gradient-to-t from-french-gold/20 via-cream/10 to-transparent rounded-full blur-xl"
          />
        ))}
      </div>

      {/* Floating Food Elements (Fries, Burger, Momo, Coffee Cup) */}
      <AnimatePresence>
        {stage >= 2 && (
          <>
            {/* Burger */}
            <motion.div
              initial={{ scale: 0, x: -120, y: -40, opacity: 0 }}
              animate={{ scale: 1, x: -140, y: -60, opacity: 0.9, rotate: -12 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              className="absolute hidden md:flex p-3 rounded-2xl bg-french-brown/80 border border-french-gold/30 shadow-2xl backdrop-blur-md items-center gap-2"
            >
              <span className="text-3xl">🍔</span>
            </motion.div>

            {/* Fries */}
            <motion.div
              initial={{ scale: 0, x: 120, y: -50, opacity: 0 }}
              animate={{ scale: 1, x: 140, y: -70, opacity: 0.9, rotate: 15 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
              className="absolute hidden md:flex p-3 rounded-2xl bg-french-brown/80 border border-french-gold/30 shadow-2xl backdrop-blur-md items-center gap-2"
            >
              <span className="text-3xl">🍟</span>
            </motion.div>

            {/* Momo */}
            <motion.div
              initial={{ scale: 0, x: -130, y: 70, opacity: 0 }}
              animate={{ scale: 1, x: -150, y: 90, opacity: 0.9, rotate: 10 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.2 }}
              className="absolute hidden md:flex p-3 rounded-2xl bg-french-brown/80 border border-french-gold/30 shadow-2xl backdrop-blur-md items-center gap-2"
            >
              <span className="text-3xl">🥟</span>
            </motion.div>

            {/* Coffee Cup */}
            <motion.div
              initial={{ scale: 0, x: 130, y: 80, opacity: 0 }}
              animate={{ scale: 1, x: 150, y: 100, opacity: 0.9, rotate: -8 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.3 }}
              className="absolute hidden md:flex p-3 rounded-2xl bg-french-brown/80 border border-french-gold/30 shadow-2xl backdrop-blur-md items-center gap-2"
            >
              <span className="text-3xl">☕</span>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Logo & Animated Cafe Bell Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Bell Header */}
        <motion.div
          animate={stage >= 1 ? { rotate: [0, -25, 25, -15, 15, -8, 8, 0] } : {}}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="relative mb-6"
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-french-gold via-french-gold-hover to-[#9E8024] p-1 shadow-2xl gold-glow flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-french-dark flex items-center justify-center p-3">
              <img
                src="/assets/logo.jfif"
                alt="French Bell Logo"
                className="w-full h-full object-contain rounded-full border border-french-gold/40"
              />
            </div>
          </div>

          {/* Golden Sound Ripple Effect */}
          {stage >= 1 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-french-gold pointer-events-none"
            />
          )}
        </motion.div>

        {/* Dynamic DING! Handwritten Burst */}
        <AnimatePresence>
          {stage >= 1 && stage < 3 && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 10 }}
              animate={{ scale: 1.2, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="mb-4 font-handwriting text-5xl sm:text-6xl text-french-gold font-bold drop-shadow-[0_4px_12px_rgba(212,175,55,0.8)] tracking-wide"
            >
              DING! 🔔
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Sequence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col items-center"
        >
          <p className="font-serif italic text-french-cream/90 text-lg sm:text-2xl mb-2 tracking-wide font-medium">
            "Your cravings just walked in."
          </p>

          <h1 className="font-serif font-extrabold text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-french-cream via-french-gold-light to-french-gold tracking-wider uppercase mt-1">
            FRENCH BELL CAFE
          </h1>

          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-french-gold to-transparent rounded-full mt-4" />
        </motion.div>
      </div>
    </motion.div>
  );
}
