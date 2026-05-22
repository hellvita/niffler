'use client';
import { useState } from 'react';
import type { ParseResult, ColumnMapping, PreviewResult, ImportResult } from '@/lib/types/api';
import { FileDropzone } from '@/components/import/FileDropzone';
import { ColumnMapper } from '@/components/import/ColumnMapper';
import { ImportPreviewTable } from '@/components/import/ImportPreviewTable';
import { ImportResultSummary } from '@/components/import/ImportResultSummary';

type Stage = 'upload' | 'map' | 'preview' | 'result';

export default function ImportPage() {
  const [stage, setStage] = useState<Stage>('upload');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleParsed = (result: ParseResult) => {
    setParseResult(result);
    setStage('map');
  };

  const handlePreview = (m: ColumnMapping, p: PreviewResult) => {
    setMapping(m);
    setPreviewResult(p);
    setStage('preview');
  };

  const handleImport = (result: ImportResult) => {
    setImportResult(result);
    setStage('result');
  };

  const reset = () => {
    setStage('upload');
    setParseResult(null);
    setMapping(null);
    setPreviewResult(null);
    setImportResult(null);
  };

  const STAGE_LABELS: Record<Stage, string> = {
    upload: '1. Upload file',
    map: '2. Map columns',
    preview: '3. Preview',
    result: '4. Done',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Import</h1>
        <span className="text-sm text-zinc-400 dark:text-zinc-500">{STAGE_LABELS[stage]}</span>
      </div>

      {stage === 'upload' && <FileDropzone onSuccess={handleParsed} />}

      {stage === 'upload' && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Template
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Not sure what format to use? Download the template — it has sample data for two months
            and instructions inside the file explaining all column rules.
          </p>
          <a
            href="/import-template.xlsx"
            download
            className="self-start text-sm px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Download template
          </a>
        </div>
      )}

      {stage === 'map' && parseResult && (
        <ColumnMapper
          parseResult={parseResult}
          initialMapping={mapping ?? undefined}
          onPreview={handlePreview}
          onBack={() => {
            setStage('upload');
            setParseResult(null);
          }}
        />
      )}

      {stage === 'preview' && mapping && previewResult && (
        <ImportPreviewTable
          mapping={mapping}
          previewResult={previewResult}
          onImport={handleImport}
          onBack={() => setStage('map')}
        />
      )}

      {stage === 'result' && importResult && (
        <ImportResultSummary result={importResult} onReset={reset} />
      )}
    </div>
  );
}
