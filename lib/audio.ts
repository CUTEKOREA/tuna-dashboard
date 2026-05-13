export function playSonarPing() {
  if (typeof window === 'undefined') return;

  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  // High pitch ping that quickly echoes/decays
  osc.type = 'sine';
  osc.frequency.setValueAtTime(850, ctx.currentTime);
  
  // Quick attack and long decay
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 1.5);
}

export function playVHFRadioChatter() {
  if (typeof window === 'undefined') return;

  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();

  const duration = 1.0 + Math.random() * 2.5; // length of transmission

  // White noise buffer for static
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1; // white noise
  }

  // Node 1: Static noise
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 2000;
  noiseFilter.Q.value = 0.5;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0, ctx.currentTime);
  noiseGain.gain.setValueAtTime(0.07, ctx.currentTime + 0.05); // squelch burst in
  noiseGain.gain.setValueAtTime(0.015, ctx.currentTime + 0.2); // drop noise during talking
  noiseGain.gain.setValueAtTime(0.015, ctx.currentTime + duration - 0.2);
  noiseGain.gain.setValueAtTime(0.07, ctx.currentTime + duration - 0.1); // squelch burst out
  noiseGain.gain.setValueAtTime(0, ctx.currentTime + duration);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start();

  // Node 2: "Voice" (modulated oscillator)
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';

  // Randomize pitch to sound like harsh mumbling
  let time = 0.2;
  while (time < duration - 0.2) {
    if (Math.random() > 0.2) {
      osc.frequency.setTargetAtTime(200 + Math.random() * 600, ctx.currentTime + time, 0.02);
    }
    time += Math.random() * 0.15 + 0.05;
  }

  const voiceFilter = ctx.createBiquadFilter();
  voiceFilter.type = 'bandpass';
  voiceFilter.frequency.value = 1500;
  voiceFilter.Q.value = 3; // "telephone" quality
  
  const voiceGain = ctx.createGain();
  voiceGain.gain.setValueAtTime(0, ctx.currentTime);
  voiceGain.gain.setValueAtTime(0, ctx.currentTime + 0.2); // wait for squelch
  
  // Voice envelope
  time = 0.2;
  while (time < duration - 0.2) {
    let segment = Math.random() * 0.2 + 0.1;
    if (Math.random() > 0.2) { // speaking
      voiceGain.gain.setTargetAtTime(0.04, ctx.currentTime + time, 0.02);
    } else { // pause
      voiceGain.gain.setTargetAtTime(0, ctx.currentTime + time, 0.02);
    }
    time += segment;
  }
  voiceGain.gain.setTargetAtTime(0, ctx.currentTime + duration - 0.2, 0.02);

  osc.connect(voiceFilter);
  voiceFilter.connect(voiceGain);
  voiceGain.connect(ctx.destination);
  osc.start(ctx.currentTime + 0.2);
  osc.stop(ctx.currentTime + duration - 0.2);

  // Node 3: Roger Beep at the end
  const beepOsc = ctx.createOscillator();
  beepOsc.type = 'sine';
  beepOsc.frequency.value = 2500;
  
  const beepGain = ctx.createGain();
  beepGain.gain.setValueAtTime(0, ctx.currentTime);
  beepGain.gain.setValueAtTime(0.04, ctx.currentTime + duration - 0.1);
  beepGain.gain.setValueAtTime(0, ctx.currentTime + duration);

  beepOsc.connect(beepGain);
  beepGain.connect(ctx.destination);
  beepOsc.start(ctx.currentTime + duration - 0.05);
  beepOsc.stop(ctx.currentTime + duration + 0.1);
}
