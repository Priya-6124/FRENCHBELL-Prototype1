// Web Audio API Bell Sound Synthesizer for French Bell Cafe "DING!"

export const playBellDing = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Golden bell chime frequencies
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1479.98, ctx.currentTime); // F#6 frequency
    
    // Quick attack, long resonant bell decay
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.8);
  } catch (err) {
    console.log('Audio playback prevented or unsupported:', err);
  }
};
