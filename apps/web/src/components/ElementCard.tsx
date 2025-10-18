import { useDraggable } from '@dnd-kit/core';
import clsx from 'clsx';
import { FormElement } from '../state/types';

interface ElementCardProps {
  element: FormElement;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export const ElementCard: React.FC<ElementCardProps> = ({ element, index, isActive, onSelect, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: element.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onSelect}
      className={clsx(
        'group relative flex cursor-grab flex-col gap-3 rounded-2xl border bg-white/90 p-5 shadow-sm transition',
        isActive ? 'border-brand-400 ring-2 ring-brand-200' : 'border-slate-200 hover:border-brand-200'
      )}
    >
      <div className="flex items-start justify-between">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-500">
          {element.type}
        </span>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="invisible rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition group-hover:visible hover:bg-red-50 hover:text-red-500"
        >
          Remove
        </button>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-900">
          {index + 1}. {element.label}
          {element.required ? <span className="ml-1 text-red-500">*</span> : null}
        </p>
        <Preview element={element} />
        {element.helperText ? <p className="text-xs text-slate-500">{element.helperText}</p> : null}
      </div>
    </div>
  );
};

const Preview: React.FC<{ element: FormElement }> = ({ element }) => {
  switch (element.type) {
    case 'heading':
      return (
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          {element.level === 1 ? (
            <h1 className="text-xl font-bold text-slate-800">{element.label}</h1>
          ) : element.level === 2 ? (
            <h2 className="text-lg font-semibold text-slate-800">{element.label}</h2>
          ) : (
            <h3 className="text-base font-semibold text-slate-800">{element.label}</h3>
          )}
        </div>
      );
    case 'textarea':
      return <div className="h-24 w-full rounded-xl border border-dashed border-slate-300 bg-white/70" />;
    case 'select':
      return (
        <div className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          Choose an option
        </div>
      );
    case 'radio':
    case 'checkbox':
      return (
        <div className="space-y-2">
          {element.options.map((option) => (
            <div key={option.id} className="flex items-center gap-2 text-sm text-slate-600">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300" />
              {option.label}
            </div>
          ))}
        </div>
      );
    default:
      return <div className="h-11 w-full rounded-xl border border-dashed border-slate-300 bg-white/70" />;
  }
};
