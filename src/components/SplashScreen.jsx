import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coffee } from 'lucide-react';
import { playSplashSound, playPopSound } from '../utils/audio';
import {
  BurgerIcon,
  FriesIcon,
  PizzaIcon,
  CroissantIcon,
  DonutIcon,
  CoffeeCupIcon,
  CakeIcon,
  SandwichIcon,
  CookieIcon,
  DrinkCupIcon,
} from './FoodIllustrations';

// 10 Floating Illustrated Cafe Food Items for the Magical Spiral Portal
const PORTAL_FOODS = [
  {
    id: 'burger',
    name: 'Gourmet Burger',
    Icon: BurgerIcon,
    startAngle: -80, // Top
    radiusMul: 1.05,
    turns: 1.5,
    delay: 0.0,
    duration: 2.8,
    tilt: 16,
  },
  {
    id: 'croissant',
    name: 'Butter Croissant',
    Icon: CroissantIcon,
    startAngle: -35, // Top-Right
    radiusMul: 0.94,
    turns: 1.4,
    delay: 0.14,
    duration: 2.75,
    tilt: -18,
  },
  {
    id: 'fries',
    name: 'Crispy Fries',
    Icon: FriesIcon,
    startAngle: 15, // Right
    radiusMul: 1.08,
    turns: 1.55,
    delay: 0.28,
    duration: 2.85,
    tilt: 15,
  },
  {
    id: 'donut',
    name: 'Berry Donut',
    Icon: DonutIcon,
    startAngle: 55, // Bottom-Right
    radiusMul: 0.92,
    turns: 1.45,
    delay: 0.42,
    duration: 2.75,
    tilt: -16,
  },
  {
    id: 'pizza',
    name: 'Cheesy Pizza',
    Icon: PizzaIcon,
    startAngle: 105, // Bottom
    radiusMul: 1.04,
    turns: 1.5,
    delay: 0.56,
    duration: 2.8,
    tilt: 18,
  },
  {
    id: 'coffee',
    name: 'Espresso Latte',
    Icon: CoffeeCupIcon,
    startAngle: 150, // Bottom-Left
    radiusMul: 0.96,
    turns: 1.42,
    delay: 0.70,
    duration: 2.75,
    tilt: -14,
  },
  {
    id: 'cake',
    name: 'Chocolate Cake',
    Icon: CakeIcon,
    startAngle: 195, // Left
    radiusMul: 1.06,
    turns: 1.55,
    delay: 0.84,
    duration: 2.85,
    tilt: 16,
  },
  {
    id: 'sandwich',
    name: 'Club Sandwich',
    Icon: SandwichIcon,
    startAngle: 240, // Top-Left
    radiusMul: 0.93,
    turns: 1.45,
    delay: 0.98,
    duration: 2.75,
    tilt: -18,
  },
  {
    id: 'cookie',
    name: 'Choco Cookie',
    Icon: CookieIcon,
    startAngle: 285, // Upper-Left
    radiusMul: 1.02,
    turns: 1.48,
    delay: 1.12,
    duration: 2.8,
    tilt: 19,
  },
  {
    id: 'drink',
    name: 'Iced Beverage',
    Icon: DrinkCupIcon,
    startAngle: 335, // Upper-Right
    radiusMul: 0.98,
    turns: 1.38,
    delay: 1.26,
    duration: 2.75,
    tilt: -16,
  },
];

export default function SplashScreen({ onComplete }) {
  const [exiting, setExiting] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [textPhase, setTextPhase] = useState(1);
  const [portalPulse, setPortalPulse] = useState(0);
  const [rippleKeys, setRippleKeys] = useState([]);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Viewport-adaptive base radius
  const baseRadius = useMemo(() => {
    const { width, height } = windowDimensions;
    const minDim = Math.min(width, height);

    if (width < 480) {
      return Math.round(width * 0.44);
    } else if (width < 768) {
      return Math.round(minDim * 0.46);
    } else if (width < 1280) {
      return Math.round(minDim * 0.48);
    } else {
      return Math.min(540, Math.round(minDim * 0.5));
    }
  }, [windowDimensions]);

  useEffect(() => {
    try {
      sessionStorage.setItem('fb_visited', '1');
    } catch (e) {}

    // Golden welcome chime
    try {
      playSplashSound();
    } catch (e) {}

    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        setIsZooming(true);
        setTimeout(() => {
          setExiting(true);
          if (onComplete) onComplete();
        }, 400);
      }, 1600);
      return () => clearTimeout(timer);
    }

    const timers = [];

    // Text Transition (Phase 1 -> Phase 2)
    const textTimer = setTimeout(() => {
      setTextPhase(2);
    }, 2000);
    timers.push(textTimer);

    // Gravitational pulses when items enter the center
    PORTAL_FOODS.forEach((food) => {
      const hitTimeMs = (food.delay + food.duration * 0.94) * 1000;
      const t = setTimeout(() => {
        setPortalPulse((prev) => prev + 1);
        setRippleKeys((prev) => [...prev.slice(-4), Date.now()]);
        try {
          playPopSound();
        } catch (e) {}
      }, hitTimeMs);
      timers.push(t);
    });

    // Camera Zoom Through Transition: At ~3.8s smoothly zoom through the center logo into homepage
    const zoomTimeMs = 3800;
    const tZoom = setTimeout(() => {
      setIsZooming(true);
      try {
        playSplashSound();
      } catch (e) {}
    }, zoomTimeMs);
    timers.push(tZoom);

    // Complete transition and enter homepage
    const finishTimeMs = 4250;
    const tFinish = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 80);
    }, finishTimeMs);
    timers.push(tFinish);

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [onComplete, prefersReducedMotion]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="frenchbell-magical-portal"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#140804] overflow-hidden select-none"
        >
          {/* ============================================================ */}
          {/* 1. Deep Espresso Cosmic Atmosphere & Glowing Portal Background */}
          {/* ============================================================ */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Deep Warm Gradient Base */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at center, #241208 0%, #170904 45%, #0B0402 100%)',
              }}
            />

            {/* Glowing Golden Core Nebula */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] md:w-[1100px] h-[600px] sm:h-[850px] md:h-[1100px] rounded-full blur-[140px] pointer-events-none opacity-45"
              style={{
                background:
                  'radial-gradient(circle, rgba(212, 175, 55, 0.45) 0%, rgba(160, 100, 35, 0.22) 40%, transparent 70%)',
              }}
            />

            {/* Glowing Amber Warmth Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] rounded-full bg-amber-600/25 blur-[80px] pointer-events-none" />

            {/* Continuous Rotating Spiral Energy Streams (Galaxy Whirlpool) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[940px] md:w-[1200px] h-[700px] sm:h-[940px] md:h-[1200px] pointer-events-none opacity-40"
            >
              <svg viewBox="0 0 1000 1000" fill="none" className="w-full h-full">
                <defs>
                  <linearGradient id="streamGold1" x1="0" y1="0" x2="1000" y2="1000" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D4AF37" stopOpacity="0.85" />
                    <stop offset="0.5" stopColor="#F5B041" stopOpacity="0.4" />
                    <stop offset="1" stopColor="#B38F29" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="streamGold2" x1="1000" y1="0" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8F1D7" stopOpacity="0.7" />
                    <stop offset="0.5" stopColor="#D4AF37" stopOpacity="0.25" />
                    <stop offset="1" stopColor="#C09C2E" stopOpacity="0.75" />
                  </linearGradient>
                </defs>

                {/* Logarithmic Spiral Arm 1 */}
                <path
                  d="M 500 500 C 500 420, 560 360, 640 360 C 760 360, 860 460, 860 580 C 860 740, 720 860, 540 860 C 340 860, 180 700, 180 500 C 180 260, 360 100, 600 100 C 760 100, 920 180, 960 300"
                  stroke="url(#streamGold1)"
                  strokeWidth="2"
                  strokeDasharray="14 18"
                  strokeLinecap="round"
                />

                {/* Counter Spiral Arm 2 */}
                <path
                  d="M 500 500 C 500 580, 440 640, 360 640 C 240 640, 140 540, 140 420 C 140 260, 280 140, 460 140 C 660 140, 820 300, 820 500 C 820 740, 640 900, 400 900 C 240 900, 80 820, 40 700"
                  stroke="url(#streamGold2)"
                  strokeWidth="1.6"
                  strokeDasharray="8 14"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>

            {/* Counter-Rotating Middle Energy Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] sm:w-[600px] md:w-[740px] h-[440px] sm:h-[600px] md:h-[740px] rounded-full border border-french-gold/25 border-dashed pointer-events-none opacity-45"
            />

            {/* Ambient Floating Stardust & Aroma Flecks */}
            <div className="absolute top-[22%] left-[19%] w-2 h-2 rounded-full bg-french-gold/60 blur-[0.5px] animate-pulse" />
            <div className="absolute top-[30%] right-[17%] w-1.5 h-1.5 rounded-full bg-amber-400/60 blur-[0.5px] animate-ping" />
            <div className="absolute bottom-[28%] left-[24%] w-2 h-2 rounded-full bg-french-gold/50 blur-[0.5px] animate-pulse" />
            <div className="absolute bottom-[20%] right-[25%] w-1.5 h-1.5 rounded-full bg-amber-300/60 blur-[0.5px]" />
          </div>

          {/* ============================================================ */}
          {/* 2. Central Stage with Zoom-Through Transition (No Skip Button) */}
          {/* ============================================================ */}
          <motion.div
            animate={{
              scale: isZooming ? 14 : 1,
              opacity: isZooming ? 0 : 1,
            }}
            transition={{
              duration: isZooming ? 0.48 : 0.2,
              ease: 'easeIn',
            }}
            className="relative z-10 flex flex-col items-center justify-center w-full h-full max-w-4xl px-4 pointer-events-none"
          >
            {/* ------------------------------------------------------------ */}
            {/* Ultra-Smooth Continuous Polar Spiral Vortex (GPU Accelerated) */}
            {/* ------------------------------------------------------------ */}
            {!prefersReducedMotion && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
                {PORTAL_FOODS.map((food) => {
                  const { Icon } = food;
                  const startRadius = baseRadius * food.radiusMul;
                  const totalTurns = food.turns;
                  const startAngle = food.startAngle;
                  const endAngle = startAngle + totalTurns * 360;

                  return (
                    <div
                      key={food.id}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ width: 0, height: 0 }}
                    >
                      {/* 1. Orbiting Arm: Rotates around center origin smoothly */}
                      <motion.div
                        initial={{ rotate: startAngle }}
                        animate={{ rotate: endAngle }}
                        transition={{
                          duration: food.duration,
                          delay: food.delay,
                          ease: [0.32, 0, 0.24, 1], // Pure continuous cubic bezier
                        }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 0,
                          height: 0,
                          transformOrigin: '0 0',
                        }}
                      >
                        {/* 2. Inward Radial Gravity: Continuously pulls item from startRadius down to 0 */}
                        <motion.div
                          initial={{
                            x: startRadius,
                            scale: 0.35,
                            opacity: 0,
                          }}
                          animate={{
                            x: [startRadius, 0],
                            scale: [0.35, 1.05, 1.0, 0.85, 0.05],
                            opacity: [0, 1, 1, 1, 0],
                          }}
                          transition={{
                            x: {
                              duration: food.duration,
                              delay: food.delay,
                              ease: [0.4, 0.05, 0.2, 1], // Smooth acceleration inward
                            },
                            scale: {
                              duration: food.duration,
                              delay: food.delay,
                              times: [0, 0.18, 0.65, 0.88, 1],
                              ease: 'easeInOut',
                            },
                            opacity: {
                              duration: food.duration,
                              delay: food.delay,
                              times: [0, 0.12, 0.88, 0.96, 1],
                              ease: 'easeInOut',
                            },
                          }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            transformOrigin: 'center center',
                          }}
                        >
                          {/* 3. Living Food Item: Gentle weightless bob & tilt */}
                          <motion.div
                            animate={{
                              rotate: [0, food.tilt, -food.tilt * 0.6, food.tilt * 0.3, 0],
                              y: [0, -6, 6, -4, 0],
                            }}
                            transition={{
                              duration: food.duration,
                              delay: food.delay,
                              ease: 'easeInOut',
                            }}
                            className="-translate-x-1/2 -translate-y-1/2 w-13 h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#2D160C]/90 via-[#1F0E07]/90 to-[#120603]/95 p-2 sm:p-2.5 border border-french-gold/50 shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_16px_rgba(212,175,55,0.3)] backdrop-blur-md flex items-center justify-center pointer-events-none"
                          >
                            <div className="w-full h-full flex items-center justify-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                              <Icon className="w-full h-full" />
                            </div>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* Central Portal Core with Authentic FrenchBell Logo */}
            {/* ------------------------------------------------------------ */}
            <div className="relative flex flex-col items-center justify-center z-20">
              {/* Gravitational Shockwave Ripple Rings */}
              {rippleKeys.map((key) => (
                <motion.div
                  key={key}
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="absolute w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full border-2 border-french-gold pointer-events-none shadow-[0_0_25px_rgba(212,175,55,0.5)]"
                />
              ))}

              {/* Pulsing Luminous Portal Badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: portalPulse > 0 ? [1, 1.09, 0.96, 1.02, 1] : 1,
                  opacity: 1,
                }}
                transition={{
                  scale: { duration: 0.28, ease: 'easeOut' },
                  opacity: { duration: 0.4 },
                }}
                className="relative"
              >
                {/* Radiant Golden Portal Halo */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-french-gold via-amber-500 to-french-gold-hover blur-2xl opacity-60 scale-125 -z-10 animate-pulse" />

                {/* Outer Golden Portal Ring */}
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full p-2 bg-gradient-to-tr from-french-gold via-[#F8F1D7] to-[#B38F29] shadow-2xl flex items-center justify-center gold-glow">
                  {/* Inner Dark Espresso Badge with Authentic Logo */}
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#1F110A] p-1.5 border-2 border-french-gold shadow-inner flex items-center justify-center">
                    <img
                      src="/assets/logo.jfif"
                      alt="FrenchBell Cafe"
                      className="w-full h-full object-contain rounded-full select-none"
                      loading="eager"
                    />
                  </div>
                </div>
              </motion.div>

              {/* ------------------------------------------------------------ */}
              {/* Sequential Magical Portal Typography */}
              {/* ------------------------------------------------------------ */}
              <div className="min-h-[72px] flex items-center justify-center mt-7">
                <AnimatePresence mode="wait">
                  {textPhase === 1 ? (
                    /* Phase 1: "Follow the aroma..." */
                    <motion.div
                      key="text-phase-1"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center gap-2 text-center"
                    >
                      <Sparkles className="w-4 h-4 text-french-gold animate-spin" />
                      <h2 className="font-serif italic font-medium text-2xl sm:text-3xl text-[#F8F1D7] tracking-wider drop-shadow-md">
                        Follow the aroma...
                      </h2>
                      <Sparkles className="w-4 h-4 text-french-gold animate-spin" />
                    </motion.div>
                  ) : (
                    /* Phase 2: "You're entering FrenchBell Cafe ☕✨" */
                    <motion.div
                      key="text-phase-2"
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.45 }}
                      className="flex flex-col items-center space-y-1.5 text-center"
                    >
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-french-gold/20 border border-french-gold/50 text-french-gold text-xs sm:text-sm font-bold uppercase tracking-widest backdrop-blur-md">
                        <Coffee className="w-3.5 h-3.5 text-french-gold animate-bounce" />
                        <span>You&apos;re entering FrenchBell Cafe</span>
                        <Sparkles className="w-3.5 h-3.5 text-french-gold" />
                      </div>
                      <p className="text-[11px] sm:text-xs text-french-cream/70 font-sans tracking-wide">
                        Handcrafted gourmet flavors await
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress Aura Capsule */}
              <div className="w-36 sm:w-48 h-1 bg-french-gold/20 rounded-full overflow-hidden mt-4">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: prefersReducedMotion ? 1.4 : 3.6,
                    ease: 'easeInOut',
                  }}
                  className="h-full bg-gradient-to-r from-french-gold via-amber-400 to-french-gold-hover rounded-full shadow-[0_0_10px_rgba(212,175,55,0.8)]"
                />
              </div>
            </div>
          </motion.div>

          {/* Flash bloom when zooming through the portal */}
          {isZooming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.95, 0] }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute inset-0 bg-[#FAF5ED] pointer-events-none z-50"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
