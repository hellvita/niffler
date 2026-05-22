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
            ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 cursor-not-allowed'
            : isDragging
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer'
        }`}
      >
        {isPending ? (
          <>
            <div className="w-8 h-8 rounded-full border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 animate-spin" />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Processing…</span>
          </>
        ) : (
          <>
            <span className="text-3xl">📂</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
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

      {fileError && <p className="text-sm text-red-500 px-1">{fileError}</p>}
    </div>
  );
}
