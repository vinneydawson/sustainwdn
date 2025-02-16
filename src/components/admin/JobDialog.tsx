
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathways } from "@/hooks/use-pathways";
import type { JobRole } from "@/types/job";
import type { JobFormData } from "@/hooks/use-jobs";

interface JobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: JobFormData) => void;
  initialData?: JobRole;
}

export function JobDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: JobDialogProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<JobFormData>({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || { content: "" },
      level: initialData?.level || "entry",
      pathway_id: initialData?.pathway_id || "",
      salary: initialData?.salary || "",
      certificates_degrees: initialData?.certificates_degrees || null,
      tasks_responsibilities: initialData?.tasks_responsibilities || null,
      licenses: initialData?.licenses || null,
      job_projections: initialData?.job_projections || null,
      resources: initialData?.resources || null,
      related_jobs: initialData?.related_jobs || null,
      projections: initialData?.projections || null,
    },
  });

  const { pathways } = usePathways();
  const selectedPathwayId = watch("pathway_id");

  useEffect(() => {
    if (open) {
      reset({
        title: initialData?.title || "",
        description: initialData?.description || { content: "" },
        level: initialData?.level || "entry",
        pathway_id: initialData?.pathway_id || "",
        salary: initialData?.salary || "",
        certificates_degrees: initialData?.certificates_degrees || null,
        tasks_responsibilities: initialData?.tasks_responsibilities || null,
        licenses: initialData?.licenses || null,
        job_projections: initialData?.job_projections || null,
        resources: initialData?.resources || null,
        related_jobs: initialData?.related_jobs || null,
        projections: initialData?.projections || null,
      });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: JobFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Job Role" : "Add New Job Role"}
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
                placeholder="Enter job title..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description.content")}
                required
                placeholder="Enter job description..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="level">Level</Label>
              <Select
                value={watch("level")}
                onValueChange={(value) => setValue("level", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pathway">Career Pathway</Label>
              <Select
                value={selectedPathwayId}
                onValueChange={(value) => setValue("pathway_id", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pathway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {pathways?.map((pathway) => (
                      <SelectItem key={pathway.id} value={pathway.id}>
                        {pathway.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salary">Salary Range</Label>
              <Input
                id="salary"
                {...register("salary")}
                placeholder="Enter salary range..."
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
              {initialData ? "Save Changes" : "Add Job Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
