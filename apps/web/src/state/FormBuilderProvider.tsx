import { createContext, useContext, useMemo, useReducer } from 'react';
import { nanoid } from 'nanoid';
import produce from 'immer';
import type { FormBuilderState, FormElement, FormElementType, OptionItem } from './types';

interface FormBuilderContextValue extends FormBuilderState {
  addElement: (type: FormElementType) => void;
  updateElement: (id: string, updater: (element: FormElement) => FormElement) => void;
  removeElement: (id: string) => void;
  reorderElements: (activeId: string, overId: string) => void;
  setActiveElement: (id?: string) => void;
  setFormName: (name: string) => void;
  setDescription: (description: string) => void;
  markSaving: (isSaving: boolean) => void;
  markSaved: () => void;
}

const initialState: FormBuilderState = {
  elements: [],
  formName: 'Untitled form',
  description: 'Design a beautiful form with the modern builder.',
  isSaving: false
};

type Action =
  | { type: 'ADD_ELEMENT'; element: FormElement }
  | { type: 'UPDATE_ELEMENT'; id: string; element: FormElement }
  | { type: 'REMOVE_ELEMENT'; id: string }
  | { type: 'REORDER'; activeId: string; overId: string }
  | { type: 'SET_ACTIVE'; id?: string }
  | { type: 'SET_FORM_NAME'; name: string }
  | { type: 'SET_DESCRIPTION'; description: string }
  | { type: 'MARK_SAVING'; isSaving: boolean }
  | { type: 'MARK_SAVED'; timestamp: string };

const FormBuilderContext = createContext<FormBuilderContextValue | undefined>(undefined);

const baseElementFactory = (type: FormElementType): FormElement => {
  const id = nanoid();
  switch (type) {
    case 'heading':
      return {
        id,
        type,
        label: 'Section heading',
        level: 2
      };
    case 'textarea':
      return {
        id,
        type,
        label: 'Long answer',
        placeholder: 'Enter a detailed response',
        rows: 4,
        required: false
      };
    case 'select':
    case 'radio':
    case 'checkbox': {
      const options: OptionItem[] = [
        { id: nanoid(), label: 'Option 1', value: 'option-1' },
        { id: nanoid(), label: 'Option 2', value: 'option-2' }
      ];
      return {
        id,
        type,
        label: 'Multiple choice',
        required: false,
        options,
        layout: 'vertical'
      };
    }
    default:
      return {
        id,
        type,
        label: 'Short answer',
        placeholder: 'Type here…',
        required: false
      };
  }
};

const reducer = produce((draft: FormBuilderState, action: Action) => {
  switch (action.type) {
    case 'ADD_ELEMENT':
      draft.elements.push(action.element);
      draft.activeElementId = action.element.id;
      break;
    case 'UPDATE_ELEMENT': {
      const index = draft.elements.findIndex((el) => el.id === action.id);
      if (index >= 0) {
        draft.elements[index] = action.element;
      }
      break;
    }
    case 'REMOVE_ELEMENT':
      draft.elements = draft.elements.filter((el) => el.id !== action.id);
      if (draft.activeElementId === action.id) {
        draft.activeElementId = undefined;
      }
      break;
    case 'REORDER': {
      const from = draft.elements.findIndex((el) => el.id === action.activeId);
      const to = draft.elements.findIndex((el) => el.id === action.overId);
      if (from === -1 || to === -1) return;
      const [item] = draft.elements.splice(from, 1);
      draft.elements.splice(to, 0, item);
      break;
    }
    case 'SET_ACTIVE':
      draft.activeElementId = action.id;
      break;
    case 'SET_FORM_NAME':
      draft.formName = action.name;
      break;
    case 'SET_DESCRIPTION':
      draft.description = action.description;
      break;
    case 'MARK_SAVING':
      draft.isSaving = action.isSaving;
      break;
    case 'MARK_SAVED':
      draft.isSaving = false;
      draft.lastSavedAt = action.timestamp;
      break;
    default:
      break;
  }
});

export const FormBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<FormBuilderContextValue>(() => ({
    ...state,
    addElement: (type: FormElementType) => {
      const element = baseElementFactory(type);
      dispatch({ type: 'ADD_ELEMENT', element });
    },
    updateElement: (id: string, updater: (element: FormElement) => FormElement) => {
      const current = state.elements.find((element) => element.id === id);
      if (!current) return;
      const updated = updater(current);
      dispatch({ type: 'UPDATE_ELEMENT', id, element: updated });
    },
    removeElement: (id: string) => dispatch({ type: 'REMOVE_ELEMENT', id }),
    reorderElements: (activeId: string, overId: string) => dispatch({ type: 'REORDER', activeId, overId }),
    setActiveElement: (id?: string) => dispatch({ type: 'SET_ACTIVE', id }),
    setFormName: (name: string) => dispatch({ type: 'SET_FORM_NAME', name }),
    setDescription: (description: string) => dispatch({ type: 'SET_DESCRIPTION', description }),
    markSaving: (isSaving: boolean) => dispatch({ type: 'MARK_SAVING', isSaving }),
    markSaved: () => dispatch({ type: 'MARK_SAVED', timestamp: new Date().toISOString() })
  }), [state]);

  return <FormBuilderContext.Provider value={value}>{children}</FormBuilderContext.Provider>;
};

export const useFormBuilderStore = () => {
  const ctx = useContext(FormBuilderContext);
  if (!ctx) throw new Error('useFormBuilderStore must be used within a FormBuilderProvider');
  return ctx;
};
