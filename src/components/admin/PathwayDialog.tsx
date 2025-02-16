
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CareerPathway } from "@/types/job";

interface PathwayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<CareerPathway>) => void;
  initialData?: CareerPathway;
}

export function PathwayDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: PathwayDialogProps) {
  const { register, handleSubmit, reset } = useForm<Partial<CareerPathway>>({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || { content: "" },
      icon: initialData?.icon || "BookOpen",
      salary_range: initialData?.salary_range || "",
      skills: initialData?.skills || [],
    },
  });

  useEffect(() => {
    if (open) {
      reset(initialData || {
        title: "",
        description: { content: "" },
        icon: "BookOpen",
        salary_range: "",
        skills: [],
      });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: Partial<CareerPathway>) => {
    onSubmit({
      ...data,
      description: { content: data.description?.content || "" },
      skills: data.skills?.filter(Boolean) || [],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Pathway" : "Add New Pathway"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register("title")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description.content")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                {...register("salary_range")}
                placeholder="e.g. $50,000 - $80,000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                {...register("skills")}
                placeholder="e.g. Project Management, Leadership, Communication"
                onChange={(e) => {
                  const value = e.target.value;
                  e.target.value = value
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                    .join(", ");
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Save Changes" : "Add Pathway"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
