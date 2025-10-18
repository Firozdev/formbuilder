import { useMutation } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useMemo } from 'react';
import { useFormBuilderStore } from '../state/FormBuilderProvider';
import { useTenantId } from '../hooks/useTenantId';

const saveForm = async (payload: unknown, tenantId: string) => {
  const response = await fetch('/api/forms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error('Failed to save form');
  }
  return response.json();
};

export const TopBar: React.FC = () => {
  const { formName, setFormName, description, setDescription, elements, markSaved, markSaving, isSaving, lastSavedAt } =
    useFormBuilderStore();
  const tenantId = useTenantId();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!tenantId) return null;
      markSaving(true);
      const result = await saveForm(
        {
          name: formName,
          description,
          elements
        },
        tenantId
      );
      markSaved();
      return result;
    }
  });

  const helper = useMemo(() => {
    if (isSaving) return 'Saving…';
    if (lastSavedAt) {
      return `Saved ${formatDistanceToNow(new Date(lastSavedAt), { addSuffix: true })}`;
    }
    return 'Not saved yet';
  }, [isSaving, lastSavedAt]);

  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={formName}
          onChange={(event) => setFormName(event.target.value)}
          className="min-w-[220px] flex-1 rounded-2xl border border-transparent bg-slate-100 px-4 py-3 text-lg font-semibold text-slate-800 transition focus:border-brand-400 focus:bg-white focus:outline-none"
        />
        <button
          type="button"
          disabled={!tenantId || mutation.isLoading}
          onClick={() => mutation.mutate()}
          className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {mutation.isLoading ? 'Saving…' : 'Save form'}
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <textarea
          value={description ?? ''}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add a friendly description for collaborators"
          className="w-full rounded-2xl border border-transparent bg-slate-100 px-4 py-3 text-sm text-slate-600 transition focus:border-brand-400 focus:bg-white focus:outline-none"
        />
        <div className="flex w-full items-center justify-between text-xs text-slate-500 md:w-auto">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">Tenant: {tenantId ?? 'loading…'}</span>
          <span>{helper}</span>
        </div>
      </div>
    </header>
  );
};
