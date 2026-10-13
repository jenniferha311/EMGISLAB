import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../../utils/audioEngine';

interface SpectrumCanvasProps {
  isPlaying: boolean;
  staticFrequencies?: Float32Array;
  staticMagnitudes?: Float32Array;
  peaks?: { frequency: number; magnitude: number }[];
  height?: number;
  maxFreq?: number; // e.g. 2000 Hz
  label?: string;
}

export const SpectrumCanvas: React.FC<SpectrumCanvasProps> = ({
  isPlaying,
  staticFrequencies,
  staticMagnitudes,
  peaks = [],
  height = 160,
  maxFreq = 2000,
  label = 'Phổ tần số FFT (Biên độ dB vs Tần số Hz)',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (staticFrequencies && staticMagnitudes && staticFrequencies.length > 0) {
      // Draw static FFT spectrum
      const width = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, h);

      // Grid lines
      drawGrid(ctx, width, h, maxFreq);

      // Curve
      ctx.strokeStyle = '#f59e0b';
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      let started = false;
      for (let i = 0; i < staticFrequencies.length; i++) {
        const freq = staticFrequencies[i];
        if (freq > maxFreq) break;
        const x = (freq / maxFreq) * width;
        // magnitude is in -80 dB to 0 dB
        const db = staticMagnitudes[i];
        const normalized = Math.max(0, Math.min(1, (db + 80) / 80));
        const y = h - normalized * (h - 24) - 12;

        if (!started) {
          ctx.moveTo(x, h);
          ctx.lineTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.lineTo(width, h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw peaks
      peaks.forEach((peak, idx) => {
        if (peak.frequency <= maxFreq) {
          const px = (peak.frequency / maxFreq) * width;
          const normalized = Math.max(0, Math.min(1, (peak.magnitude + 80) / 80));
          const py = h - normalized * (h - 24) - 12;

          // Marker circle
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();

          // Text label
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 10px JetBrains Mono, monospace';
          const text = `f${idx + 1}:${peak.frequency}Hz`;
          ctx.fillText(text, Math.min(px - 15, width - 65), Math.max(py - 8, 14));
        }
      });

      return;
    }

    // Live Web Audio FFT
    const analyser = audioEngine.getAnalyser();
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const sampleRate = audioEngine.getContextSampleRate();
    const binSize = sampleRate / analyser.fftSize;

    const draw = () => {
      animIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, h);

      drawGrid(ctx, width, h, maxFreq);

      // Gradient bars / curve
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(0.5, '#f59e0b');
      gradient.addColorStop(1, '#ef4444');

      ctx.fillStyle = gradient;

      const maxBin = Math.min(bufferLength, Math.ceil(maxFreq / binSize));
      const barWidth = width / maxBin;

      for (let i = 0; i < maxBin; i++) {
        const val = dataArray[i]; // 0 to 255
        const barHeight = (val / 255) * (h - 28);
        const x = i * barWidth;
        const y = h - barHeight - 16;
        ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
      }

      // Draw peaks detected from current static peaks prop if available
      peaks.forEach((peak, idx) => {
        if (peak.frequency <= maxFreq) {
          const px = (peak.frequency / maxFreq) * width;
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 10px JetBrains Mono, monospace';
          ctx.fillText(`f${idx + 1}:${peak.frequency}Hz`, px - 15, 20 + idx * 12);
        }
      });
    };

    draw();

    return () => {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
      }
    };
  }, [isPlaying, staticFrequencies, staticMagnitudes, peaks, maxFreq]);

  function drawGrid(ctx: CanvasRenderingContext2D, width: number, h: number, maxF: number) {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    // Freq markers: 250, 500, 750, 1000, 1500, 2000
    const markers = [250, 500, 1000, 1500, 2000].filter((f) => f <= maxF);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';

    markers.forEach((f) => {
      const x = (f / maxF) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h - 16);
      ctx.stroke();
      ctx.fillText(`${f}Hz`, x - 12, h - 4);
    });

    // Horizontal dB lines (-20dB, -40dB, -60dB)
    [-20, -40, -60].forEach((db) => {
      const y = h - ((db + 80) / 80) * (h - 24) - 12;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillText(`${db}dB`, 4, y - 2);
    });
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
        <span>{label}</span>
        <span>0 – {maxFreq} Hz (Hann Window)</span>
      </div>
      <div className="relative rounded border border-stone-300 overflow-hidden bg-slate-950 shadow-inner">
        <canvas
          ref={canvasRef}
          width={640}
          height={height}
          className="w-full h-auto block"
        />
      </div>
    </div>
  );
};
