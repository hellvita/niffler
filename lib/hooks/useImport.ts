'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { parseFile, previewImport, executeImport } from '@/lib/api/import';
import type { ColumnMapping } from '@/lib/types/api';

export function useParseImportFile() {
  return useMutation({
    mutationFn: (file: File) => parseFile(file),
  });
}

export function usePreviewImport() {
  return useMutation({
    mutationFn: (mapping: ColumnMapping) => previewImport(mapping),
  });
}

export function useExecuteImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mapping: ColumnMapping) => executeImport(mapping),
    onSuccess: () => {
      // Import can create categories and populate any past day — bust everything
      qc.invalidateQueries({ queryKey: ['summary'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
