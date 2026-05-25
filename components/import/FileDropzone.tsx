'use client';
import { useRef, useState } from 'react';
import { useParseImportFile } from '@/lib/hooks/useImport';
import type { ParseResult } from '@/lib/types/api';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const e = err as { status?: number; detail?: { detail?: string } };
    if (e.status === 413) return 'File is too large. Maximum allowed size is 10 MB.';
    if (e.status === 400) {
      const detail = e.detail?.detail ?? '';
      if (detail.includes('exactly one sheet')) {
        return 'This file has multiple sheets. Please export or save only the sheet you want to import, then try again.';
      }
      return detail || 'Invalid file format.';
    }
    return e.detail?.detail ?? 'Failed to process file. Please try again.';
  }
  return 'Failed to process file. Please try again.';
}

export function FileDropzone({ onSuccess }: { onSuccess: (result: ParseResult) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: parse, isPending } = useParseImportFile();

  const processFile = (file: File) => {
    setFileError(null);
    parse(file, {
      onSuccess,
      onError: (err) => setFileError(getErrorMessage(err)),
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() => !isPending && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-3 w-full h-48 rounded-xl border-2 border-dashed transition-colors ${
          isPending
            ? 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] cursor-not-allowed'
            : isDragging
              ? 'border-[var(--color-focus-ring)] bg-[var(--color-bg-secondary)]'
              : 'border-[var(--color-btn-secondary-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-btn-secondary-hover)] cursor-pointer'
        }`}
      >
        {isPending ? (
          <>
            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-btn-secondary-border)] border-t-[var(--color-text-primary)] animate-spin" />
            <span className="text-sm text-[var(--color-text-secondary)]">Processing…</span>
          </>
        ) : (
          <>
            <span className="text-3xl">📂</span>
            <span className="text-sm text-[var(--color-text-secondary)]">
              Drop an <strong>.xlsx</strong> file here, or click to browse
            </span>
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        className="hidden"
      />

      {fileError && <p className="text-sm text-[var(--color-error)] px-1">{fileError}</p>}
    </div>
  );
}
