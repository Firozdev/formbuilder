import { useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { FormElementType } from '../state/types';

interface PaletteItemProps {
  type: FormElementType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const PaletteItem: React.FC<PaletteItemProps> = ({ type, label, description, icon }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `palette-${type}`, data: { type } });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white/90 p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
      type="button"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </button>
  );
};

export const Palette: React.FC<{ onSelect: (type: FormElementType) => void }> = ({ onSelect }) => {
  const items = useMemo<PaletteItemProps[]>(
    () => [
      {
        type: 'heading',
        label: 'Section heading',
        description: 'Break your form into digestible sections.',
        icon: '🧭'
      },
      {
        type: 'text',
        label: 'Short answer',
        description: 'Collect concise textual responses.',
        icon: '✏️'
      },
      {
        type: 'textarea',
        label: 'Long answer',
        description: 'Allow people to provide detailed feedback.',
        icon: '📝'
      },
      {
        type: 'email',
        label: 'Email',
        description: 'Capture contact information securely.',
        icon: '📧'
      },
      {
        type: 'number',
        label: 'Number',
        description: 'Enforce numeric responses for metrics.',
        icon: '🔢'
      },
      {
        type: 'date',
        label: 'Date',
        description: 'Let respondents pick a date or deadline.',
        icon: '📅'
      },
      {
        type: 'select',
        label: 'Dropdown',
        description: 'Offer a list of predefined options.',
        icon: '🔽'
      },
      {
        type: 'radio',
        label: 'Single choice',
        description: 'Prompt respondents to choose one answer.',
        icon: '⭕️'
      },
      {
        type: 'checkbox',
        label: 'Multiple choice',
        description: 'Allow selecting several options at once.',
        icon: '☑️'
      }
    ],
    []
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Form elements</h2>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">Drag & drop</span>
      </div>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.type} onClick={() => onSelect(item.type)}>
            <PaletteItem {...item} />
          </div>
        ))}
      </div>
    </div>
  );
};
