import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
import { FormElement } from '../state/types';
import { useFormBuilderStore } from '../state/FormBuilderProvider';
import { ElementCard } from './ElementCard';
import { EmptyState } from './EmptyState';

export const Canvas: React.FC = () => {
  const { elements, addElement, reorderElements, setActiveElement, removeElement, activeElementId } = useFormBuilderStore();
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeDrag, setActiveDrag] = useState<FormElement | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const type = event.active.data?.current?.type;
    if (type) {
      const timeout = setTimeout(() => addElement(type), 0);
      setActiveDrag(null);
      return () => clearTimeout(timeout);
    }
    const element = elements.find((el) => el.id === event.active.id);
    if (element) {
      setActiveElement(element.id);
      setActiveDrag(element);
    }
    return undefined;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveDrag(null);
      return;
    }
    const type = active.data?.current?.type;
    if (type) {
      setActiveDrag(null);
      return;
    }
    if (active.id !== over.id) {
      reorderElements(String(active.id), String(over.id));
    }
    setActiveDrag(null);
  };

  const handleDragCancel = () => setActiveDrag(null);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={elements.map((element) => element.id)} strategy={arrayMove}>
        <div className="min-h-[620px] rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6">
          {elements.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {elements.map((element, index) => (
                <ElementCard
                  key={element.id}
                  element={element}
                  index={index}
                  isActive={activeElementId === element.id}
                  onSelect={() => setActiveElement(element.id)}
                  onRemove={() => removeElement(element.id)}
                />
              ))}
            </div>
          )}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeDrag ? (
          <div className="w-[480px] max-w-full">
            <ElementCard
              element={activeDrag}
              index={elements.findIndex((el) => el.id === activeDrag.id)}
              isActive
              onSelect={() => setActiveElement(activeDrag.id)}
              onRemove={() => removeElement(activeDrag.id)}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
