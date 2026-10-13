/**
 * Web Audio Engine for EMGIS LAB
 * Provides mathematical additive synthesis with inharmonic decay modes
 * and real-time audio analysis (FFT, Hann window, peak detection).
 */

export interface GongMode {
  id: number;
  name: string;
  frequency: number; // Hz
  amplitude: number; // 0 - 1
  decay: number;     // s^-1 (lambda)
  phase: number;     // radians
}

export interface StrikePreset {
  name: string;
  description: string;
  strikeZone: 'ron' | 'than' | 'vanh'; // Rốn chiêng, Thân giữa, Vành chiêng
  malletType: 'soft' | 'hard';
  modes: GongMode[];
}

export const GONG_PRESETS: Record<string, StrikePreset> = {
  chieng_dam_soft: {
    name: 'Chiêng Mẹ (Chiêng Dàm) – Dùi bọc vải',
    description: 'Âm trầm sâu lắng, mode cơ bản rốn chiêng nổi trội, họa âm cao suy giảm nhanh.',
    strikeZone: 'ron',
    malletType: 'soft',
    modes: [
      { id: 1, name: 'Mode 1 (Cơ bản)', frequency: 182, amplitude: 0.95, decay: 0.65, phase: 0 },
      { id: 2, name: 'Mode 2 (Phi điều hòa)', frequency: 284, amplitude: 0.42, decay: 1.10, phase: 0.5 },
      { id: 3, name: 'Mode 3 (Uốn vành)', frequency: 458, amplitude: 0.28, decay: 1.80, phase: 1.2 },
      { id: 4, name: 'Mode 4 (Bậc cao)', frequency: 672, amplitude: 0.16, decay: 2.60, phase: 0.8 },
      { id: 5, name: 'Mode 5 (Vi thể)', frequency: 935, amplitude: 0.08, decay: 3.50, phase: 2.1 },
    ],
  },
  chieng_khong_hard: {
    name: 'Chiêng Con (Ke) – Dùi gỗ trần',
    description: 'Âm cao đanh gọn, gõ gần vành kích thích nhiều thành phần tần số cao trên 600 Hz.',
    strikeZone: 'vanh',
    malletType: 'hard',
    modes: [
      { id: 1, name: 'Mode 1 (Cơ bản)', frequency: 324, amplitude: 0.70, decay: 1.20, phase: 0 },
      { id: 2, name: 'Mode 2 (Vành ngoài)', frequency: 512, amplitude: 0.78, decay: 1.60, phase: 0.3 },
      { id: 3, name: 'Mode 3 (Họa âm cao)', frequency: 830, amplitude: 0.65, decay: 2.20, phase: 1.0 },
      { id: 4, name: 'Mode 4 (Keng sắc)', frequency: 1240, amplitude: 0.45, decay: 3.20, phase: 1.7 },
      { id: 5, name: 'Mode 5 (Gờ viền)', frequency: 1680, amplitude: 0.25, decay: 4.50, phase: 0.2 },
    ],
  },
  chieng_bong_mid: {
    name: 'Chiêng Dóng (Bồng) – Gõ thân giữa',
    description: 'Cân bằng giữa âm nền ấm và sắc thái rền vang lan tỏa của thân chiêng.',
    strikeZone: 'than',
    malletType: 'soft',
    modes: [
      { id: 1, name: 'Mode 1 (Cơ bản)', frequency: 245, amplitude: 0.85, decay: 0.85, phase: 0 },
      { id: 2, name: 'Mode 2 (Uốn thân)', frequency: 395, amplitude: 0.55, decay: 1.35, phase: 0.7 },
      { id: 3, name: 'Mode 3 (Lan tỏa)', frequency: 615, amplitude: 0.38, decay: 2.10, phase: 1.4 },
      { id: 4, name: 'Mode 4 (Rền)', frequency: 890, amplitude: 0.22, decay: 2.80, phase: 0.5 },
      { id: 5, name: 'Mode 5 (Sáng)', frequency: 1310, amplitude: 0.12, decay: 3.90, phase: 2.3 },
    ],
  },
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode {
    const ctx = this.ensureContext();
    if (!this.analyser) {
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.85;
    }
    return this.analyser;
  }

  /**
   * Synthesize Chiêng strike using additive damped sinusoidal modes:
   * x(t) = sum A_i * exp(-lambda_i * t) * sin(2*pi*f_i*t + phi_i)
   */
  public playSyntheticGong(
    modes: GongMode[],
    strikeVolume = 1.0,
    mallet: 'soft' | 'hard' = 'soft'
  ): void {
    const ctx = this.ensureContext();
    const analyser = this.getAnalyser();

    // Stop previous notes smoothly
    this.stopActiveSynth();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7 * strikeVolume, ctx.currentTime);
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    // Initial mallet strike noise burst (soft thud for soft mallet, click for hard mallet)
    this.triggerMalletImpulse(ctx, masterGain, mallet);

    const now = ctx.currentTime;

    modes.forEach((m) => {
      if (m.frequency <= 20 || m.amplitude <= 0.001) return;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(m.frequency, now);

      // Mallet filter factor: hard mallet excites high frequencies more
      let effectiveAmp = m.amplitude;
      if (mallet === 'soft' && m.frequency > 500) {
        effectiveAmp *= Math.max(0.2, 1 - (m.frequency - 500) / 1200);
      } else if (mallet === 'hard' && m.frequency > 500) {
        effectiveAmp *= 1.25;
      }

      // Attack: fast exponential ramp up (5-15 ms)
      const attackTime = mallet === 'soft' ? 0.012 : 0.004;
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, effectiveAmp), now + attackTime);

      // Exponential decay: exp(-lambda * t)
      // Duration when gain falls to 0.001 (approx -60 dB)
      const safeDecay = Math.max(0.2, m.decay);
      const t60 = 6.9 / safeDecay; // ln(1000) ≈ 6.9
      const totalDuration = Math.min(6.5, t60);

      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + totalDuration);

      osc.connect(gainNode);
      gainNode.connect(masterGain);

      osc.start(now);
      osc.stop(now + totalDuration + 0.1);

      this.activeOscillators.push({ osc, gain: gainNode });
    });
  }

  private triggerMalletImpulse(ctx: AudioContext, dest: AudioNode, mallet: 'soft' | 'hard') {
    const bufferSize = ctx.sampleRate * 0.04; // 40 ms burst
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (mallet === 'soft' ? (bufferSize * 0.25) : (bufferSize * 0.08)));
      data[i] = (Math.random() * 2 - 1) * decay * (mallet === 'soft' ? 0.2 : 0.4);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = mallet === 'soft' ? 'lowpass' : 'bandpass';
    filter.frequency.setValueAtTime(mallet === 'soft' ? 350 : 1800, ctx.currentTime);

    noise.connect(filter);
    filter.connect(dest);
    noise.start();
  }

  public stopActiveSynth(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.activeOscillators.forEach(({ osc, gain }) => {
      try {
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        osc.stop(ctx.currentTime + 0.06);
      } catch {
        // Ignore already stopped
      }
    });
    this.activeOscillators = [];
  }

  /**
   * Decode uploaded file or recorded blob for FFT analysis
   */
  public async decodeAudioData(blob: Blob): Promise<AudioBuffer> {
    const ctx = this.ensureContext();
    const arrayBuffer = await blob.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  }

  /**
   * Perform FFT with Hann windowing on an AudioBuffer segment and find peaks
   */
  public analyzeAudioBuffer(
    buffer: AudioBuffer,
    fftSize = 2048,
    maxPeaks = 5
  ): {
    sampleRate: number;
    freqResolution: number;
    frequencies: Float32Array;
    magnitudes: Float32Array;
    peaks: { frequency: number; magnitude: number }[];
    waveform: Float32Array;
  } {
    const sampleRate = buffer.sampleRate;
    const channelData = buffer.getChannelData(0);
    const n = Math.min(fftSize, channelData.length);
    const freqResolution = sampleRate / n;

    // Extract first representative slice or transient
    const slice = new Float64Array(n);
    let maxAbs = 0.0001;
    for (let i = 0; i < n; i++) {
      if (Math.abs(channelData[i]) > maxAbs) maxAbs = Math.abs(channelData[i]);
    }

    // Apply Hann window: w(i) = 0.5 * (1 - cos(2*pi*i / (n-1)))
    for (let i = 0; i < n; i++) {
      const hann = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
      slice[i] = (channelData[i] / maxAbs) * hann;
    }

    // Simple Discrete Fourier Transform / Fast calculation for magnitude spectrum up to 2500 Hz
    const halfN = Math.floor(n / 2);
    const maxBin = Math.min(halfN, Math.ceil(2500 / freqResolution));
    const magnitudes = new Float32Array(maxBin);
    const frequencies = new Float32Array(maxBin);

    for (let k = 0; k < maxBin; k++) {
      frequencies[k] = k * freqResolution;
      let real = 0;
      let imag = 0;
      // Stride sampling if n is large for instant client performance
      const stride = n > 4096 ? 2 : 1;
      for (let t = 0; t < n; t += stride) {
        const angle = (2 * Math.PI * k * t) / n;
        real += slice[t] * Math.cos(angle);
        imag -= slice[t] * Math.sin(angle);
      }
      const mag = Math.sqrt(real * real + imag * imag) / (n / 2);
      // Convert to relative dB scale: 20 * log10(mag)
      const db = 20 * Math.log10(Math.max(0.00001, mag));
      magnitudes[k] = Math.max(-80, db);
    }

    // Peak detection: local maxima with prominence
    const peaks: { frequency: number; magnitude: number }[] = [];
    for (let k = 2; k < maxBin - 2; k++) {
      if (
        magnitudes[k] > magnitudes[k - 1] &&
        magnitudes[k] > magnitudes[k - 2] &&
        magnitudes[k] > magnitudes[k + 1] &&
        magnitudes[k] > magnitudes[k + 2] &&
        magnitudes[k] > -55
      ) {
        // Parabolic interpolation for fine frequency resolution
        const alpha = magnitudes[k - 1];
        const beta = magnitudes[k];
        const gamma = magnitudes[k + 1];
        const p = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma);
        const refinedFreq = (k + p) * freqResolution;
        peaks.push({
          frequency: Math.round(refinedFreq),
          magnitude: Math.round(beta * 10) / 10,
        });
      }
    }

    // Sort by magnitude descending and take top peaks
    peaks.sort((a, b) => b.magnitude - a.magnitude);
    const topPeaks = peaks.slice(0, maxPeaks).sort((a, b) => a.frequency - b.frequency);

    // Waveform downsampled representation
    const waveformLength = 400;
    const waveform = new Float32Array(waveformLength);
    const step = Math.floor(n / waveformLength);
    for (let i = 0; i < waveformLength; i++) {
      waveform[i] = channelData[i * step] || 0;
    }

    return {
      sampleRate,
      freqResolution: Math.round(freqResolution * 10) / 10,
      frequencies,
      magnitudes,
      peaks: topPeaks,
      waveform,
    };
  }

  public getContextSampleRate(): number {
    return this.ensureContext().sampleRate;
  }
}

export const audioEngine = new AudioEngine();
