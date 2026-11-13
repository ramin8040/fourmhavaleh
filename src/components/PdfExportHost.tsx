import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FormTemplate, PrintSettings, TableItemRow } from '../types/form';
import { OfficialPrintDocument } from './OfficialPrintDocument';
import { exportDomElementToPdf, getPdfReferenceWidthPx } from '../utils/pdfExport';

export interface PdfExportJob {
  id: string;
  template: FormTemplate;
  formData: Record<string, any>;
  tableData: Record<string, TableItemRow[]>;
  signatureData: Record<string, string>;
  printSettings?: PrintSettings;
  fileName: string;
}

interface PdfExportHostProps {
  job: PdfExportJob | null;
  onSuccess: (fileName: string, pageCount: number) => void;
  onError: (message: string) => void;
  onFinish: () => void;
}

export const PdfExportHost: React.FC<PdfExportHostProps> = ({
  job,
  onSuccess,
  onError,
  onFinish,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const runningJobIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!job || runningJobIdRef.current === job.id) return;
    runningJobIdRef.current = job.id;

    const runExport = async () => {
      try {
        // Give React + embedded logos/signatures a brief tick to mount cleanly
        await new Promise((r) => setTimeout(r, 80));
        const target = sheetRef.current;
        if (!target) {
          throw new Error('قالب سند برای ساخت فایل PDF آماده نشد.');
        }

        const paperSize = job.printSettings?.paperSize || job.template.paperSize;
        const orientation = job.printSettings?.orientation || job.template.orientation;

        const result = await exportDomElementToPdf(target, {
          paperSize,
          orientation,
          fileName: job.fileName,
          scale: 2,
        });

        onSuccess(result.fileName, result.pageCount);
      } catch (err: any) {
        onError(err?.message || 'خطا در ساخت خروجی PDF فرم.');
      } finally {
        runningJobIdRef.current = null;
        onFinish();
      }
    };

    runExport();
  }, [job, onSuccess, onError, onFinish]);

  if (!job || typeof document === 'undefined') return null;

  const paperSize = job.printSettings?.paperSize || job.template.paperSize;
  const orientation = job.printSettings?.orientation || job.template.orientation;
  const widthPx = getPdfReferenceWidthPx(paperSize, orientation);

  return createPortal(
    <div
      aria-hidden="true"
      data-testid="pdf-export-offscreen-host"
      style={{
        position: 'fixed',
        left: '-16000px',
        top: 0,
        width: `${widthPx}px`,
        backgroundColor: '#ffffff',
        color: '#000000',
        pointerEvents: 'none',
        zIndex: -10,
      }}
    >
      <div
        ref={sheetRef}
        dir="rtl"
        style={{
          width: `${widthPx}px`,
          backgroundColor: '#ffffff',
          color: '#000000',
        }}
      >
        <OfficialPrintDocument
          embeddedPreview={true}
          template={job.template}
          formData={job.formData}
          tableData={job.tableData}
          signatureData={job.signatureData}
          printSettings={job.printSettings}
        />
      </div>
    </div>,
    document.body
  );
};
