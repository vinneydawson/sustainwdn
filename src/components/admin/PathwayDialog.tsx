
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
  const { register, handleSubmit, reset } = useForm<Omit<CareerPathway, 'id' | 'created_at' | 'updated_at'>>({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || { content: "" },
      icon: initialData?.icon || "BookOpen",
      requirements: initialData?.requirements || null,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: initialData?.title || "",
        description: initialData?.description || { content: "" },
        icon: initialData?.icon || "BookOpen",
        requirements: initialData?.requirements || null,
      });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: any) => {
    const formattedData = {
      ...data,
      skills: [],
      salary_range: null,
    };
    
    onSubmit(formattedData);
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
                placeholder="e.g. Software Development, Data Science, UI/UX Design"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description.content")}
                required
                placeholder="Enter a detailed description of the career pathway..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-primary-600 hover:bg-primary-700"
            >
              {initialData ? "Save Changes" : "Add Pathway"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
