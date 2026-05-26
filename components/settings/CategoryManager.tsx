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
import { useCategoryColors } from '@/lib/hooks/useCategoryColors';
import { categoryNameSchema } from '@/lib/validation/schemas';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Skeleton } from '@/components/shared/Skeleton';
import type { Category } from '@/lib/types/api';

function CategoryColorSwatch({
  id,
  color,
  onColorChange,
}: {
  id: string;
  color: string;
  onColorChange: (id: string, color: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        style={{ backgroundColor: color }}
        className="w-5 h-5 rounded flex-shrink-0 ring-1 ring-[var(--color-border)]"
        aria-label="Pick color"
        type="button"
      />
      <input
        ref={inputRef}
        type="color"
        value={color}
        onChange={(e) => onColorChange(id, e.target.value)}
        className="sr-only"
      />
    </>
  );
}

export function CategoryManager() {
  const [showArchived, setShowArchived] = useState(false);
  const { data: categories, isLoading } = useCategories(showArchived);

  const { getColor, setColor } = useCategoryColors();

  const createCategory = useCreateCategory();
  const renameCategory = useRenameCategory();
  const mergeCategory = useMergeCategory();
  const archiveCategory = useArchiveCategory();
  const unarchiveCategory = useUnarchiveCategory();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const escPressedRef = useRef(false);

  const [mergeConfirm, setMergeConfirm] = useState<{
    fromId: string;
    fromName: string;
    targetId: string;
    targetName: string;
  } | null>(null);

  const [archiveTarget, setArchiveTarget] = useState<Category | null>(null);

  const [addValue, setAddValue] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

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
    const active = (categories ?? []).filter((c) => !c.isArchived);
    const target = active.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== cat.id
    );
    if (target) {
      setMergeConfirm({
        fromId: cat.id,
        fromName: cat.name,
        targetId: target.id,
        targetName: target.name,
      });
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
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    );
  }

  const list = categories ?? [];

  return (
    <div className="flex flex-col gap-3">
      {list.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)]">No categories yet.</p>
      )}
      {list.map((cat, index) => (
        <div
          key={cat.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] ${
            cat.isArchived
              ? 'opacity-60 bg-[var(--color-surface-raised)]'
              : 'bg-[var(--color-surface)]'
          }`}
        >
          <CategoryColorSwatch
            id={cat.id}
            color={getColor(cat.id, index)}
            onColorChange={setColor}
          />
          {editingId === cat.id ? (
            <Input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') {
                  escPressedRef.current = true;
                  e.currentTarget.blur();
                }
              }}
              onBlur={() => handleRenameBlur(cat)}
              className="flex-1 px-2 py-0.5 focus:ring-1"
            />
          ) : (
            <span className="flex-1 text-sm text-[var(--color-text-primary)]">{cat.name}</span>
          )}

          {cat.isArchived ? (
            <Button variant="text" onClick={() => handleUnarchive(cat)}>
              Unarchive
            </Button>
          ) : (
            <>
              <Button variant="text" onClick={() => startRename(cat)}>
                Rename
              </Button>
              <Button
                variant="text"
                className="text-[var(--color-error)] hover:opacity-70"
                onClick={() => setArchiveTarget(cat)}
              >
                Archive
              </Button>
            </>
          )}
        </div>
      ))}

      {unarchiveError && <p className="text-xs text-[var(--color-error)]">{unarchiveError}</p>}

      <div className="flex gap-2 mt-1">
        <Input
          value={addValue}
          onChange={(e) => {
            setAddValue(e.target.value);
            setAddError(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="New category name"
          className="flex-1"
        />
        <Button loading={createCategory.isPending} onClick={handleAdd}>
          Add
        </Button>
      </div>
      {addError && <p className="text-xs text-[var(--color-error)]">{addError}</p>}

      <label className="flex items-center gap-2 cursor-pointer select-none mt-1">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
          className="rounded border-[var(--color-btn-secondary-border)]"
        />
        <span className="text-sm text-[var(--color-text-secondary)]">Show archived categories</span>
      </label>

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
