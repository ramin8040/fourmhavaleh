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
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-[#202020] rounded-lg shadow-xl border border-slate-300 dark:border-[#383838] w-full max-w-md overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-[#2d2d2d] bg-[#f9fafb] dark:bg-[#1a1a1a]">
          <div className="flex items-center gap-2 font-bold text-xs">
            <PenTool className="w-4 h-4 text-[#0067C0] dark:text-[#4cc2ff]" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="p-4 bg-slate-50 dark:bg-[#16181d]">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
            با استفاده از ماوس یا قلم نوری، امضای خود را در کادر زیر رسم نمایید:
          </div>
          <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md bg-white overflow-hidden shadow-inner">
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
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs">
                محل رسم امضا...
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-[#2d2d2d] bg-[#f9fafb] dark:bg-[#1a1a1a] text-xs">
          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2d2d2d] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>پاک کردن کادر</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-[#2a2a2a] text-slate-700 dark:text-slate-300 transition-colors"
            >
              انصراف
            </button>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-1 px-4 py-1.5 rounded bg-[#0067C0] hover:bg-[#005a9e] dark:bg-[#0078D4] dark:hover:bg-[#006cbd] text-white font-medium shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>تأیید و درج در فرم</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
