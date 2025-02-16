
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CareerPathway } from "@/types/job";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from "@/lib/utils";

interface PathwayRowProps {
  pathway: CareerPathway;
  onEdit: (pathway: CareerPathway) => void;
  onDelete: (pathway: CareerPathway) => void;
}

function SortablePathwayRow({ pathway, onEdit, onDelete }: PathwayRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pathway.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style}
      className={cn(isDragging && "opacity-50 bg-accent")}
    >
      <TableCell>
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{pathway.title}</TableCell>
      <TableCell>{pathway.skills?.join(", ") || "No skills listed"}</TableCell>
      <TableCell>{pathway.salary_range || "Not specified"}</TableCell>
      <TableCell className="space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(pathway)}
        >
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDelete(pathway)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

interface PathwaysTableProps {
  pathways: CareerPathway[];
  onEdit: (pathway: CareerPathway) => void;
  onDelete: (pathway: CareerPathway) => void;
  onReorder: (pathways: CareerPathway[]) => void;
}

export function PathwaysTable({ 
  pathways, 
  onEdit, 
  onDelete,
  onReorder 
}: PathwaysTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = pathways.findIndex((pathway) => pathway.id === active.id);
      const newIndex = pathways.findIndex((pathway) => pathway.id === over.id);
      
      const newPathways = arrayMove(pathways, oldIndex, newIndex);
      onReorder(newPathways);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="text-left">Title</TableHead>
            <TableHead className="text-left">Skills</TableHead>
            <TableHead className="text-left">Salary Range</TableHead>
            <TableHead className="text-left">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <SortableContext
            items={pathways.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {pathways?.map((pathway) => (
              <SortablePathwayRow
                key={pathway.id}
                pathway={pathway}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  );
}
