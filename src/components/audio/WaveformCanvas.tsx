import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../../utils/audioEngine';

interface WaveformCanvasProps {
  isPlaying: boolean;
  staticData?: Float32Array;
  height?: number;
  label?: string;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  isPlaying,
  staticData,
  height = 140,
  label = 'Dạng sóng dao động (Waveform: Thời gian vs Biên độ)',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (staticData && staticData.length > 0) {
      // Draw static waveform
      const width = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#172722';
      ctx.fillRect(0, 0, width, h);

      // Grid lines
      ctx.strokeStyle = '#273C35';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(width, h / 2);
      ctx.stroke();

      ctx.strokeStyle = '#D6AA55';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const sliceWidth = width / staticData.length;
      let x = 0;
      for (let i = 0; i < staticData.length; i++) {
        const v = staticData[i];
        const y = (0.5 - v * 0.45) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
      return;
    }

    // Live Web Audio analyser draw loop
    const analyser = audioEngine.getAnalyser();
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animIdRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      const width = canvas.width;
      const h = canvas.height;

      // Dark forest slate background
      ctx.fillStyle = '#172722';
      ctx.fillRect(0, 0, width, h);

      // Horizontal center line
      ctx.strokeStyle = '#273C35';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(width, h / 2);
      ctx.stroke();

      // Time grid marks (ms)
      ctx.fillStyle = '#8AA39B';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText('0 ms', 6, h - 6);
      ctx.fillText('10 ms', width / 4, h - 6);
      ctx.fillText('20 ms', width / 2, h - 6);
      ctx.fillText('40 ms', (width * 3) / 4, h - 6);

      ctx.lineWidth = 2;
      ctx.strokeStyle = isPlaying ? '#D6AA55' : '#8AA39B';
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * h) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();
    };

    draw();

    return () => {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
      }
    };
  }, [isPlaying, staticData]);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs text-[#556D65] font-mono">
        <span className="font-semibold text-[#20332D]">{label}</span>
        <span className={isPlaying ? 'text-[#174C3C] font-bold' : 'text-[#556D65]'}>
          {isPlaying ? '● Đang dao động' : '○ Sẵn sàng'}
        </span>
      </div>
      <div className="relative rounded-xl border border-[#E8E2D5] overflow-hidden bg-[#172722] shadow-inner">
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
