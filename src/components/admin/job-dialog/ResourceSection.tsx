
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ResourceLink } from "./types";

interface ResourceSectionProps {
  title: string;
  resources: ResourceLink[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof ResourceLink, value: string) => void;
}

export function ResourceSection({
  title,
  resources,
  onAdd,
  onRemove,
  onUpdate,
}: ResourceSectionProps) {
  return (
    <div className="grid gap-2">
      <Label>{title}</Label>
      <div className="space-y-4">
        {resources.map((resource, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="URL"
                value={resource.url}
                onChange={(e) => onUpdate(index, 'url', e.target.value)}
              />
              <Input
                placeholder="Display Text"
                value={resource.text}
                onChange={(e) => onUpdate(index, 'text', e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={onAdd}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {title}
        </Button>
      </div>
    </div>
  );
}
