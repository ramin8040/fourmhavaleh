import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw, PenTool } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  title?: string;
  initialDataUrl?: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title = 'رسم امضا و مهر دیجیتال',
  initialDataUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set high DPI canvas resolution
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#004578'; // Navy signature ink

      // Load initial drawing if exists
      if (initialDataUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          setHasDrawn(true);
        };
        img.src = initialDataUrl;
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, initialDataUrl]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
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
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="liquid-glass-elevated rounded-3xl w-full max-w-md overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-300/40 dark:border-white/10 bg-white/40 dark:bg-slate-900/40">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            <PenTool className="w-4 h-4 text-sky-700 dark:text-sky-300" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/75 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="p-4 sm:p-5 bg-white/20 dark:bg-slate-950/30">
          <div className="text-xs text-slate-600 dark:text-slate-300 mb-2.5">
            با انگشت یا ماوس داخل کادر سفید امضای خود را بکشید:
          </div>
          <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl bg-white overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-44 cursor-crosshair touch-none bg-white"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                اینجا امضا بکشید...
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 border-t border-slate-300/40 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 text-xs">
          <button
            onClick={handleClear}
            className="h-10 flex items-center gap-1.5 px-3 rounded-xl liquid-glass-well text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>پاک کردن</span>
          </button>

          <div className="flex items-center gap-2 mr-auto">
            <button
              onClick={onClose}
              className="h-10 px-3.5 rounded-xl liquid-glass-well text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              onClick={handleConfirm}
              className="h-10 flex items-center gap-1.5 px-5 rounded-xl liquid-cta font-bold cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>ذخیره امضا</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
