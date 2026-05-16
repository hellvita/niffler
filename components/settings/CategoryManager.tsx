'use client';
import { useState, useRef } from 'react';
import {
  useCategories,
  useCreateCategory,
  useRenameCategory,
  useMergeCategory,
  useArchiveCategory,
  useUnarchiveCategory,
} from '@/lib/hooks/useCategories';
import { categoryNameSchema } from '@/lib/validation/schemas';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import type { Category } from '@/lib/types/api';

export function CategoryManager() {
  const [showArchived, setShowArchived] = useState(false);
  const { data: categories, isLoading } = useCategories(showArchived);

  const createCategory = useCreateCategory();
  const renameCategory = useRenameCategory();
  const mergeCategory = useMergeCategory();
  const archiveCategory = useArchiveCategory();
  const unarchiveCategory = useUnarchiveCategory();

  // Inline rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const escPressedRef = useRef(false);

  // Merge confirmation
  const [mergeConfirm, setMergeConfirm] = useState<{
    fromId: string; fromName: string; targetId: string; targetName: string;
  } | null>(null);

  // Archive confirmation
  const [archiveTarget, setArchiveTarget] = useState<Category | null>(null);

  // Add form
  const [addValue, setAddValue] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  // Unarchive error
  const [unarchiveError, setUnarchiveError] = useState<string | null>(null);

  const startRename = (cat: Category) => {
    setEditingId(cat.id);
    setEditValue(cat.name);
    escPressedRef.current = false;
  };

  const handleRenameBlur = (cat: Category) => {
    if (escPressedRef.current) {
      escPressedRef.current = false;
      setEditingId(null);
      return;
    }
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === cat.name) {
      setEditingId(null);
      return;
    }
    const active = (categories ?? []).filter(c => !c.isArchived);
    const target = active.find(
      c => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== cat.id,
    );
    if (target) {
      setMergeConfirm({ fromId: cat.id, fromName: cat.name, targetId: target.id, targetName: target.name });
      return;
    }
    renameCategory.mutate({ id: cat.id, name: trimmed });
    setEditingId(null);
  };

  const handleAdd = () => {
    const trimmed = addValue.trim();
    const validation = categoryNameSchema.safeParse(trimmed);
    if (!validation.success) {
      setAddError(validation.error.issues[0]?.message ?? 'Invalid name');
      return;
    }
    setAddError(null);
    createCategory.mutate(trimmed, {
      onSuccess: () => setAddValue(''),
      onError: (err: unknown) => {
        if (err instanceof Error && err.message === '409') {
          setAddError('A category with this name already exists.');
        }
      },
    });
  };

  const handleUnarchive = (cat: Category) => {
    setUnarchiveError(null);
    unarchiveCategory.mutate(cat.id, {
      onError: () => setUnarchiveError(`"${cat.name}" conflicts with an existing active category.`),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const list = categories ?? [];

  return (
    <div className="flex flex-col gap-3">
      {/* Category rows */}
      {list.length === 0 && (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">No categories yet.</p>
      )}
      {list.map(cat => (
        <div
          key={cat.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 ${
            cat.isArchived ? 'opacity-60 bg-zinc-50 dark:bg-zinc-900/50' : 'bg-white dark:bg-zinc-900'
          }`}
        >
          {editingId === cat.id ? (
            <input
              autoFocus
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') { escPressedRef.current = true; e.currentTarget.blur(); }
              }}
              onBlur={() => handleRenameBlur(cat)}
              className="flex-1 px-2 py-0.5 text-sm rounded border border-blue-400 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          ) : (
            <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-200">{cat.name}</span>
          )}

          {cat.isArchived ? (
            <button
              onClick={() => handleUnarchive(cat)}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Unarchive
            </button>
          ) : (
            <>
              <button
                onClick={() => startRename(cat)}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Rename
              </button>
              <button
                onClick={() => setArchiveTarget(cat)}
                className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
              >
                Archive
              </button>
            </>
          )}
        </div>
      ))}

      {unarchiveError && (
        <p className="text-xs text-red-500">{unarchiveError}</p>
      )}

      {/* Add form */}
      <div className="flex gap-2 mt-1">
        <input
          value={addValue}
          onChange={e => { setAddValue(e.target.value); setAddError(null); }}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="New category name"
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        />
        <button
          onClick={handleAdd}
          disabled={createCategory.isPending}
          className="px-4 py-2 text-sm rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium disabled:opacity-40 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300"
        >
          Add
        </button>
      </div>
      {addError && <p className="text-xs text-red-500">{addError}</p>}

      {/* Show archived toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none mt-1">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={e => setShowArchived(e.target.checked)}
          className="rounded border-zinc-300 dark:border-zinc-600"
        />
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Show archived categories</span>
      </label>

      {/* Archive confirmation */}
      {archiveTarget && (
        <ConfirmDialog
          message={`Archiving removes "${archiveTarget.name}" from the day view going forward. All past expenses for this category are preserved.`}
          onConfirm={() => {
            archiveCategory.mutate(archiveTarget.id);
            setArchiveTarget(null);
          }}
          onCancel={() => setArchiveTarget(null)}
        />
      )}

      {/* Merge confirmation */}
      {mergeConfirm && (
        <ConfirmDialog
          message={`A category named "${mergeConfirm.targetName}" already exists. Merge "${mergeConfirm.fromName}" into "${mergeConfirm.targetName}"? All expenses recorded under "${mergeConfirm.fromName}" will be moved to "${mergeConfirm.targetName}" and "${mergeConfirm.fromName}" will be removed.`}
          onConfirm={() => {
            mergeCategory.mutate({ id: mergeConfirm.fromId, targetId: mergeConfirm.targetId });
            setMergeConfirm(null);
            setEditingId(null);
          }}
          onCancel={() => {
            setMergeConfirm(null);
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}
