export type FormElementType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'heading';

export interface OptionItem {
  id: string;
  label: string;
  value: string;
}

export interface BaseElement {
  id: string;
  type: FormElementType;
  label: string;
  helperText?: string;
  required?: boolean;
}

export interface InputElement extends BaseElement {
  type: 'text' | 'email' | 'number' | 'date';
  placeholder?: string;
}

export interface TextareaElement extends BaseElement {
  type: 'textarea';
  placeholder?: string;
  rows?: number;
}

export interface SelectElement extends BaseElement {
  type: 'select' | 'radio' | 'checkbox';
  options: OptionItem[];
  layout?: 'vertical' | 'horizontal';
}

export interface HeadingElement extends BaseElement {
  type: 'heading';
  level: 1 | 2 | 3;
}

export type FormElement = InputElement | TextareaElement | SelectElement | HeadingElement;

export interface FormBuilderState {
  elements: FormElement[];
  activeElementId?: string;
  formName: string;
  description?: string;
  isSaving: boolean;
  lastSavedAt?: string;
}
