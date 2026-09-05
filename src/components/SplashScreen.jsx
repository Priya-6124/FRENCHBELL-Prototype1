import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import CurvedUnderline from './CurvedUnderline';

export default function SplashScreen({ onComplete }) {
  // Check if returning visitor for shorter splash
  const isReturning = typeof window !== 'undefined' && sessionStorage.getItem('fb_visited');
  const [stage, setStage] = useState(0); // 0: init, 1: logo in, 2: steam & cafe motion, 3: message in, 4: exit
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Record visit in sessionStorage
    try {
      sessionStorage.setItem('fb_visited', '1');
    } catch (e) {}

    const factor = isReturning ? 0.6 : 1.0;

    const t1 = setTimeout(() => setStage(1), 150 * factor); // Stage 1: Clean background & logo entrance
    const t2 = setTimeout(() => setStage(2), 500 * factor); // Stage 2: Cafe steam & gentle pulse
    const t3 = setTimeout(() => setStage(3), 1100 * factor); // Stage 3: Catchy brand message
    const t4 = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 450);
    }, 2200 * factor); // Stage 4: Smooth transition to home

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete, isReturning]);

  const handleSkip = () => {
    setExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 250);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.45, ease: 'easeInOut' } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#1C0D07] via-[#120603] to-[#0A0301] overflow-hidden select-none"
        >
          {/* Background Ambient Glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-french-gold/15 rounded-full blur-[130px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-amber-600/10 rounded-full blur-[80px]" />
          </div>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 z-20 px-3.5 py-1.5 rounded-full bg-french-dark/80 text-french-cream/80 hover:text-french-gold border border-french-gold/30 text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-1.5 hover:border-french-gold"
          >
            <span>Skip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Central Animated Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg space-y-6">

            {/* Logo Container with Steam & Cafe Motion */}
            <div className="relative flex flex-col items-center">

              {/* Stage 3: Gentle Steam / Aroma Animation Rising above the Logo */}
              {stage >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: [0, 0.85, 0.4, 0.85], y: [-2, -18, -26, -34] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="absolute -top-12 flex items-center justify-center gap-2 pointer-events-none"
                >
                  {/* SVG Steam Curves */}
                  <svg width="48" height="40" viewBox="0 0 48 40" fill="none" className="text-french-gold/70">
                    <path
                      d="M12 36C10 28 16 22 14 14C12 8 16 4 14 0"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M24 38C21 30 27 24 25 16C23 10 27 6 25 2"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M36 36C34 28 40 22 38 14C36 8 40 4 38 0"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.div>
              )}

              {/* Stage 2: FrenchBell Cafe Logo Entrance */}
              {stage >= 1 && (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0, y: 20 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 260,
                      damping: 20
                    }
                  }}
                  className="relative group"
                >
                  {/* Outer Golden Halo Ring */}
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 25px rgba(212, 175, 55, 0.25)',
                        '0 0 50px rgba(212, 175, 55, 0.55)',
                        '0 0 25px rgba(212, 175, 55, 0.25)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 bg-gradient-to-tr from-french-gold via-french-gold-hover to-[#C09C2E] flex items-center justify-center"
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-french-dark p-1 border-2 border-french-gold/50 shadow-inner">
                      <img
                        src="/assets/logo.jfif"
                        alt="FrenchBell Cafe"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Stage 4: Catchy Customer-Focused Brand Message */}
            {stage >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="space-y-3"
              >
                {/* Cafe Tag */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-french-gold/20 border border-french-gold/40 text-french-gold text-[11px] font-extrabold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>FrenchBell Cafe</span>
                </div>

                {/* Catchy Headline */}
                <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-french-cream leading-tight">
                  Good food. Great mood. <br />
                  <span className="text-french-gold">Your FrenchBell moment starts here.</span>
                </h1>

                {/* Decorative Curved Underline */}
                <div className="w-48 mx-auto">
                  <CurvedUnderline className="text-french-gold h-3" />
                </div>

                <p className="text-xs sm:text-sm text-french-cream/75 font-medium max-w-sm mx-auto">
                  Crispy favourites, loaded bowls, and artisanal moments made fresh for you.
                </p>
              </motion.div>
            )}

            {/* Subtle Progress Indicator */}
            <div className="w-24 h-1 bg-french-gold/20 rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: (isReturning ? 1.8 : 2.2), ease: 'linear' }}
                className="h-full bg-french-gold rounded-full"
              />
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
