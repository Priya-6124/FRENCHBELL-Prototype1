// Web Audio API Synthesizers for French Bell Cafe
// Only Splash Screen chime and Payment Success sounds are retained as requested.

export const playSplashSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Golden cafe bell chime frequencies (F#6 / 1480 Hz)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1479.98, ctx.currentTime);
    
    // Smooth bell resonance
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.8);
  } catch (err) {
    // Audio playback blocked or unsupported by browser policy
  }
};

export const playPaymentSuccessSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Upward 2-tone melodic success chime (C6 -> G6)
    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    playTone(1046.50, now, 0.4);        // C6
    playTone(1567.98, now + 0.15, 0.8); // G6
  } catch (err) {
    // Audio playback blocked or unsupported
  }
};

// Aliases for compatibility
export const playBellDing = playSplashSound;
