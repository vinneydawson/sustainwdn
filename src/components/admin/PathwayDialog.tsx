
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
  onSubmit: (data: Omit<CareerPathway, 'id' | 'created_at' | 'updated_at'>) => void;
  initialData?: CareerPathway;
}

export function PathwayDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: PathwayDialogProps) {
  const { register, handleSubmit, reset, watch } = useForm<Omit<CareerPathway, 'id' | 'created_at' | 'updated_at'>>({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || { content: "" },
      icon: initialData?.icon || "BookOpen",
      salary_range: initialData?.salary_range || "",
      skills: initialData?.skills || [],
      requirements: initialData?.requirements || null,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: initialData?.title || "",
        description: initialData?.description || { content: "" },
        icon: initialData?.icon || "BookOpen",
        salary_range: initialData?.salary_range || "",
        skills: initialData?.skills || [],
        requirements: initialData?.requirements || null,
      });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: any) => {
    // Convert skills to array, handling both string and array inputs
    const skillsArray = typeof data.skills === 'string' 
      ? data.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean)
      : Array.isArray(data.skills) 
        ? data.skills 
        : [];

    const formattedData = {
      ...data,
      skills: skillsArray,
    };
    
    onSubmit(formattedData);
    onOpenChange(false);
  };

  const skillsValue = watch("skills");
  const displaySkills = Array.isArray(skillsValue) ? skillsValue.join(", ") : skillsValue;

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
                defaultValue={displaySkills}
                placeholder="e.g. Project Management, Leadership, Communication"
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
