'use client';
import { useEffect, useRef, useState } from 'react';
import { useUpsertExpense, useDeleteExpense } from '@/lib/hooks/useExpenses';
import {
  useCategories,
  useRenameCategory,
  useMergeCategory,
  useArchiveCategory,
} from '@/lib/hooks/useCategories';
import { amountSchema } from '@/lib/validation/schemas';
import { evaluateExpression } from '@/lib/utils/expression';
import type { Category } from '@/lib/types/api';

type Mode = 'view' | 'edit-amount' | 'edit-name' | 'confirm-merge' | 'confirm-archive';

interface Props {
  date: string;
  categoryId: string;
  categoryName: string;
  amount: number;
}

export function useCategoryExpenseRow({ date, categoryId, categoryName, amount }: Props) {
  const [mode, setMode] = useState<Mode>('view');
  const [menuOpen, setMenuOpen] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [mergeTarget, setMergeTarget] = useState<Category | null>(null);

  const amountRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const escPressed = useRef(false);

  const { data: categories = [] } = useCategories(false);
  const { mutate: upsertExpense, isPending: upserting } = useUpsertExpense();
  const { mutate: deleteExpense, isPending: deleting } = useDeleteExpense();
  const { mutate: renameCategory } = useRenameCategory();
  const { mutate: mergeCategory } = useMergeCategory();
  const { mutate: archiveCategory } = useArchiveCategory();

  const isMutating = upserting || deleting;

  useEffect(() => {
    if (mode === 'edit-amount') amountRef.current?.focus();
    if (mode === 'edit-name') nameRef.current?.focus();
  }, [mode]);

  const startEditAmount = () => {
    setAmountInput(amount > 0 ? String(amount) : '');
    setMode('edit-amount');
  };

  const submitAmount = () => {
    if (!amountInput.trim()) {
      setAmountError(null);
      deleteExpense({ date, categoryId }, { onSettled: () => setMode('view') });
      return;
    }
    const val = evaluateExpression(amountInput);
    if (val === null) {
      setAmountError('Invalid expression');
      return;
    }
    if (val === 0) {
      setAmountError(null);
      deleteExpense({ date, categoryId }, { onSettled: () => setMode('view') });
      return;
    }
    const result = amountSchema.safeParse(val);
    if (!result.success) {
      setAmountError(result.error.issues[0]?.message ?? 'Invalid amount');
      return;
    }
    setAmountError(null);
    upsertExpense({ date, categoryId, amount: val }, { onSettled: () => setMode('view') });
  };

  const startEditName = () => {
    setNameInput(categoryName);
    setMenuOpen(false);
    setMode('edit-name');
  };

  const submitName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === categoryName) {
      setMode('view');
      return;
    }
    const existing = categories.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== categoryId
    );
    if (existing) {
      setMergeTarget(existing);
      setMode('confirm-merge');
      return;
    }
    renameCategory({ id: categoryId, name: trimmed }, { onSettled: () => setMode('view') });
  };

  const handleAmountChange = (val: string) => {
    if (val && !/^[0-9][0-9.+\-*/]*$/.test(val)) return;
    setAmountInput(val);
    setAmountError(null);
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
    if (e.key === 'Escape') {
      escPressed.current = true;
      setAmountError(null);
      setMode('view');
    }
  };

  const handleAmountBlur = () => {
    if (escPressed.current) {
      escPressed.current = false;
      return;
    }
    submitAmount();
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
    if (e.key === 'Escape') {
      escPressed.current = true;
      setMode('view');
    }
  };

  const handleNameBlur = () => {
    if (escPressed.current) {
      escPressed.current = false;
      return;
    }
    submitName();
  };

  const confirmMerge = () => {
    if (!mergeTarget) return;
    mergeCategory(
      { id: categoryId, targetId: mergeTarget.id },
      {
        onSettled: () => {
          setMode('view');
          setMergeTarget(null);
        },
      }
    );
  };

  const cancelMerge = () => {
    setMode('edit-name');
    setMergeTarget(null);
  };

  const confirmArchive = () => {
    archiveCategory(categoryId, { onSettled: () => setMode('view') });
  };

  const cancelArchive = () => setMode('view');

  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

  return {
    mode,
    menuOpen,
    amountInput,
    amountError,
    nameInput,
    mergeTarget,
    isMutating,
    amountRef,
    nameRef,
    setMode,
    setNameInput,
    startEditAmount,
    startEditName,
    handleAmountChange,
    handleAmountKeyDown,
    handleAmountBlur,
    handleNameKeyDown,
    handleNameBlur,
    confirmMerge,
    cancelMerge,
    confirmArchive,
    cancelArchive,
    toggleMenu,
    closeMenu,
  };
}
