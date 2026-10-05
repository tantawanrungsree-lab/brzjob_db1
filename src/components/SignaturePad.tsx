import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, Pen } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  initialSignature?: string;
  signerTitle: string;
  onCancel?: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  initialSignature,
  signerTitle,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI resolution
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasContent(true);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasContent(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800 font-medium text-sm">
          <Pen className="w-4 h-4 text-amber-600" />
          <span>เซ็นชื่อกำกับ: {signerTitle}</span>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>ล้างลายเซ็น</span>
        </button>
      </div>

      <div className="relative border border-dashed border-slate-300 rounded-lg bg-slate-50 overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-36 cursor-crosshair block"
          style={{ width: '100%', height: '144px' }}
        />
        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400">
            แตะหรือลากเมาส์เพื่อลงลายมือชื่อที่นี่
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 mt-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ยกเลิก
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!hasContent}
          className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Check className="w-3.5 h-3.5" />
          <span>ยืนยันลายเซ็น</span>
        </button>
      </div>
    </div>
  );
};
