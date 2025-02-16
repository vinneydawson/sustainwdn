
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
import type { JobRole } from "@/types/job";
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

interface JobRowProps {
  job: JobRole;
  onEdit: (job: JobRole) => void;
  onDelete: (job: JobRole) => void;
}

function SortableJobRow({ job, onEdit, onDelete }: JobRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

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
      <TableCell className="font-medium">{job.title}</TableCell>
      <TableCell className="capitalize">{job.level}</TableCell>
      <TableCell>{job.career_pathways?.title || "Not assigned"}</TableCell>
      <TableCell>{job.salary || "Not specified"}</TableCell>
      <TableCell className="space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(job)}
        >
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDelete(job)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

interface JobsTableProps {
  jobs: JobRole[];
  onEdit: (job: JobRole) => void;
  onDelete: (job: JobRole) => void;
  onReorder: (jobs: JobRole[]) => void;
}

export function JobsTable({ 
  jobs, 
  onEdit, 
  onDelete,
  onReorder 
}: JobsTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = jobs.findIndex((job) => job.id === active.id);
      const newIndex = jobs.findIndex((job) => job.id === over.id);
      
      const newJobs = arrayMove(jobs, oldIndex, newIndex);
      onReorder(newJobs);
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
            <TableHead>Title</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Career Pathway</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <SortableContext
            items={jobs.map(j => j.id)}
            strategy={verticalListSortingStrategy}
          >
            {jobs?.map((job) => (
              <SortableJobRow
                key={job.id}
                job={job}
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
