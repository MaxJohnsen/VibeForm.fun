import { QUESTION_TYPES } from '@/shared/constants/questionTypes';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { SidebarPalette, PaletteItem } from '@/shared/ui';

interface QuestionTypePaletteProps {
  onSelectType: (type: string) => void;
  className?: string;
}

// Draggable wrapper for palette items
const DraggableItem = ({
  item,
  children,
}: {
  item: PaletteItem;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.id}`,
    data: {
      type: item.id,
      source: 'palette',
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50'
      )}
    >
      {children}
    </div>
  );
};

export const QuestionTypePalette = ({ onSelectType, className }: QuestionTypePaletteProps) => {
  // Convert question types to palette items
  const paletteItems: PaletteItem[] = QUESTION_TYPES.map((qt) => ({
    id: qt.type,
    icon: qt.icon,
    label: qt.label,
    description: qt.description,
    colorClass: qt.colorClass,
  }));

  return (
    <SidebarPalette
      title="Question Types"
      subtitle="Drag or tap to add"
      items={paletteItems}
      onSelect={onSelectType}
      className={cn("w-64", className)}
      searchable
      searchPlaceholder="Search question types..."
      renderItem={(item, defaultRender) => (
        <DraggableItem key={item.id} item={item}>
          {defaultRender}
        </DraggableItem>
      )}
    />
  );
};
