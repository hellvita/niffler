import { apiMutate } from './client';
import type { ParseResult, ColumnMapping, PreviewResult, ImportResult } from '@/lib/types/api';

export async function parseFile(file: File): Promise<ParseResult> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/proxy/import/parse', { method: 'POST', body: form });
  if (!res.ok) throw Object.assign(new Error(`${res.status}`), { status: res.status, detail: await res.json() });
  return res.json();
}

export const previewImport = (mapping: ColumnMapping) =>
  apiMutate<PreviewResult>('POST', 'import/preview', mapping);

export const executeImport = (mapping: ColumnMapping) =>
  apiMutate<ImportResult>('POST', 'import/execute', mapping);
