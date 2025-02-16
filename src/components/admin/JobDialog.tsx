
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
      certificates_degrees: initialData?.certificates_degrees || {
        education: [],
        certificates: [],
        experience: [],
      },
      tasks_responsibilities: initialData?.tasks_responsibilities || {},
      licenses: initialData?.licenses || [],
      job_projections: initialData?.job_projections || [],
      resources: initialData?.resources || [],
      related_jobs: initialData?.related_jobs || [],
      projections: initialData?.projections || "",
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
        certificates_degrees: initialData?.certificates_degrees || {
          education: [],
          certificates: [],
          experience: [],
        },
        tasks_responsibilities: initialData?.tasks_responsibilities || {},
        licenses: initialData?.licenses || [],
        job_projections: initialData?.job_projections || [],
        resources: initialData?.resources || [],
        related_jobs: initialData?.related_jobs || [],
        projections: initialData?.projections || "",
      });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: JobFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  const handleArrayInput = (field: keyof JobFormData, value: string) => {
    const items = value.split(',').map(item => ({ content: item.trim() }));
    setValue(field as any, items);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
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
            <div className="grid gap-2">
              <Label htmlFor="projections">Job Projections</Label>
              <Textarea
                id="projections"
                {...register("projections")}
                placeholder="Enter job projections..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="resources">Resources (comma-separated)</Label>
              <Textarea
                id="resources"
                onChange={(e) => handleArrayInput("resources", e.target.value)}
                defaultValue={initialData?.resources?.map(r => r.content).join(", ") || ""}
                placeholder="Enter resources separated by commas..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="related_jobs">Related Jobs (comma-separated)</Label>
              <Textarea
                id="related_jobs"
                onChange={(e) => handleArrayInput("related_jobs", e.target.value)}
                defaultValue={initialData?.related_jobs?.map(j => j.content).join(", ") || ""}
                placeholder="Enter related jobs separated by commas..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="licenses">Licenses (comma-separated)</Label>
              <Textarea
                id="licenses"
                onChange={(e) => setValue("licenses", e.target.value.split(',').map(l => l.trim()))}
                defaultValue={initialData?.licenses?.join(", ") || ""}
                placeholder="Enter licenses separated by commas..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="job_projections">Job Growth Projections (comma-separated)</Label>
              <Textarea
                id="job_projections"
                onChange={(e) => setValue("job_projections", e.target.value.split(',').map(p => p.trim()))}
                defaultValue={initialData?.job_projections?.join(", ") || ""}
                placeholder="Enter job growth projections separated by commas..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Certificates & Degrees</Label>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="education">Education (comma-separated)</Label>
                  <Textarea
                    id="education"
                    onChange={(e) => setValue("certificates_degrees.education", e.target.value.split(',').map(ed => ed.trim()))}
                    defaultValue={initialData?.certificates_degrees?.education?.join(", ") || ""}
                    placeholder="Enter required education separated by commas..."
                  />
                </div>
                <div>
                  <Label htmlFor="certificates">Certificates (comma-separated)</Label>
                  <Textarea
                    id="certificates"
                    onChange={(e) => setValue("certificates_degrees.certificates", e.target.value.split(',').map(cert => cert.trim()))}
                    defaultValue={initialData?.certificates_degrees?.certificates?.join(", ") || ""}
                    placeholder="Enter required certificates separated by commas..."
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience (comma-separated)</Label>
                  <Textarea
                    id="experience"
                    onChange={(e) => setValue("certificates_degrees.experience", e.target.value.split(',').map(exp => exp.trim()))}
                    defaultValue={initialData?.certificates_degrees?.experience?.join(", ") || ""}
                    placeholder="Enter required experience separated by commas..."
                  />
                </div>
              </div>
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
