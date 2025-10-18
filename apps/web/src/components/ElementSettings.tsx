import { ChangeEvent } from 'react';
import { nanoid } from 'nanoid';
import clsx from 'clsx';
import { useFormBuilderStore } from '../state/FormBuilderProvider';
import { FormElement, HeadingElement, SelectElement } from '../state/types';

const textInputClasses = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100';

export const ElementSettings: React.FC = () => {
  const { elements, activeElementId, updateElement } = useFormBuilderStore();
  const activeElement = elements.find((element) => element.id === activeElementId);

  if (!activeElement) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-500">
        <span className="text-3xl">🛠️</span>
        <p className="text-sm">Select a field on the canvas to configure its settings.</p>
      </div>
    );
  }

  const update = (updater: (element: FormElement) => FormElement) => updateElement(activeElement.id, updater);

  const handleLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    update((element) => ({ ...element, label: value }));
  };

  const handleHelperChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    update((element) => ({ ...element, helperText: event.target.value }));
  };

  const toggleRequired = () => update((element) => ({ ...element, required: !element.required }));

  const renderAdvancedSettings = () => {
    if (activeElement.type === 'heading') {
      const handleLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
        update((element) => ({ ...element, level: Number(event.target.value) as HeadingElement['level'] }));
      };
      return (
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Heading level</label>
          <select className={textInputClasses} value={activeElement.level} onChange={handleLevelChange}>
            <option value={1}>Hero</option>
            <option value={2}>Section</option>
            <option value={3}>Sub-section</option>
          </select>
        </div>
      );
    }

    if (activeElement.type === 'textarea') {
      const handleRowsChange = (event: ChangeEvent<HTMLInputElement>) => {
        update((element) => ({ ...element, rows: Number(event.target.value) }));
      };
      return (
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rows</label>
          <input
            className={textInputClasses}
            type="number"
            min={2}
            max={12}
            value={activeElement.rows ?? 4}
            onChange={handleRowsChange}
          />
        </div>
      );
    }

    if (activeElement.type === 'select' || activeElement.type === 'radio' || activeElement.type === 'checkbox') {
      const options = (activeElement as SelectElement).options;

      const handleOptionChange = (optionId: string, key: 'label' | 'value') => (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        update((element) => {
          if (element.type !== 'select' && element.type !== 'radio' && element.type !== 'checkbox') return element;
          return {
            ...element,
            options: element.options.map((option) => (option.id === optionId ? { ...option, [key]: value } : option))
          };
        });
      };

      const addOption = () => {
        update((element) => {
          if (element.type !== 'select' && element.type !== 'radio' && element.type !== 'checkbox') return element;
          return {
            ...element,
            options: [...element.options, { id: nanoid(), label: 'New option', value: `option-${element.options.length + 1}` }]
          };
        });
      };

      const removeOption = (optionId: string) => () => {
        update((element) => {
          if (element.type !== 'select' && element.type !== 'radio' && element.type !== 'checkbox') return element;
          return {
            ...element,
            options: element.options.filter((option) => option.id !== optionId)
          };
        });
      };

      const toggleLayout = () => {
        update((element) => {
          if (element.type !== 'select' && element.type !== 'radio' && element.type !== 'checkbox') return element;
          return {
            ...element,
            layout: element.layout === 'vertical' ? 'horizontal' : 'vertical'
          };
        });
      };

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Options</h4>
            <button
              className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600"
              type="button"
              onClick={addOption}
            >
              Add option
            </button>
          </div>
          <div className="space-y-3">
            {options.map((option) => (
              <div key={option.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Option</span>
                  <button
                    type="button"
                    className="ml-auto text-xs font-medium text-red-400 transition hover:text-red-500"
                    onClick={removeOption(option.id)}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className={textInputClasses}
                  placeholder="Label"
                  value={option.label}
                  onChange={handleOptionChange(option.id, 'label')}
                />
                <input
                  className={textInputClasses}
                  placeholder="Value"
                  value={option.value}
                  onChange={handleOptionChange(option.id, 'value')}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={toggleLayout}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
          >
            Layout: {activeElement.layout === 'horizontal' ? 'Horizontal' : 'Vertical'}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Placeholder</label>
        <input
          className={textInputClasses}
          value={'placeholder' in activeElement ? activeElement.placeholder ?? '' : ''}
          onChange={(event) => {
            const value = event.target.value;
            update((element) => ({ ...element, placeholder: value } as FormElement));
          }}
        />
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Label</label>
        <input className={textInputClasses} value={activeElement.label} onChange={handleLabelChange} />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Help text</label>
        <textarea
          className={clsx(textInputClasses, 'min-h-[80px]')}
          placeholder="Provide context to respondents"
          value={activeElement.helperText ?? ''}
          onChange={handleHelperChange}
        />
      </div>
      <div>
        <button
          onClick={toggleRequired}
          className={clsx(
            'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition',
            activeElement.required
              ? 'border-brand-200 bg-brand-50 text-brand-600'
              : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200'
          )}
        >
          <span>Required field</span>
          <span>{activeElement.required ? 'On' : 'Off'}</span>
        </button>
      </div>
      {renderAdvancedSettings()}
    </div>
  );
};
