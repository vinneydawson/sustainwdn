
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
import { ResourceSection } from "./job-dialog/ResourceSection";
import { getInitialFormValues, initializeResources, formatFormData } from "./job-dialog/utils";
import type { JobDialogProps, ResourceLink } from "./job-dialog/types";

export function JobDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: JobDialogProps) {
  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [certificates, setCertificates] = useState<ResourceLink[]>([]);
  const [relatedJobs, setRelatedJobs] = useState<string[]>([]);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: getInitialFormValues(initialData),
  });

  const { pathways } = usePathways();
  const selectedPathwayId = watch("pathway_id");

  useEffect(() => {
    if (open) {
      setResources(initializeResources(initialData?.resources));
      setCertificates(initializeResources(initialData?.certificates_degrees?.certificates?.map(c => ({ content: c }))));
      setRelatedJobs(initialData?.related_jobs?.map(j => j.content) || []);
      reset(getInitialFormValues(initialData));
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: any) => {
    const formattedData = formatFormData(data, resources, certificates, relatedJobs);
    onSubmit(formattedData);
    onOpenChange(false);
  };

  const addResource = () => setResources([...resources, { url: "", text: "" }]);
  const removeResource = (index: number) => setResources(resources.filter((_, i) => i !== index));
  const updateResource = (index: number, field: keyof ResourceLink, value: string) => {
    const updatedResources = [...resources];
    updatedResources[index] = { ...updatedResources[index], [field]: value };
    setResources(updatedResources);
  };

  const addCertificate = () => setCertificates([...certificates, { url: "", text: "" }]);
  const removeCertificate = (index: number) => setCertificates(certificates.filter((_, i) => i !== index));
  const updateCertificate = (index: number, field: keyof ResourceLink, value: string) => {
    const updatedCertificates = [...certificates];
    updatedCertificates[index] = { ...updatedCertificates[index], [field]: value };
    setCertificates(updatedCertificates);
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
              <Label htmlFor="tasks_responsibilities">Tasks + Responsibilities</Label>
              <Textarea
                id="tasks_responsibilities"
                {...register("tasks_responsibilities.task_1.content")}
                placeholder="Enter tasks and responsibilities..."
                className="min-h-[200px]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="education">Education</Label>
              <Textarea
                id="education"
                {...register("certificates_degrees.education")}
                placeholder="Enter required education..."
                className="min-h-[100px]"
              />
            </div>

            <ResourceSection
              title="Certificates"
              resources={certificates}
              onAdd={addCertificate}
              onRemove={removeCertificate}
              onUpdate={updateCertificate}
            />

            <div className="grid gap-2">
              <Label htmlFor="experience">Work Experience</Label>
              <Textarea
                id="experience"
                {...register("certificates_degrees.experience")}
                placeholder="Enter required work experience..."
                className="min-h-[200px]"
              />
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
                className="min-h-[200px]"
              />
            </div>

            <ResourceSection
              title="Resources"
              resources={resources}
              onAdd={addResource}
              onRemove={removeResource}
              onUpdate={updateResource}
            />

            <div className="grid gap-2">
              <Label htmlFor="related_jobs">Other Related Jobs</Label>
              <Input
                id="related_jobs"
                value={relatedJobs.join(', ')}
                onChange={(e) => setRelatedJobs(e.target.value.split(',').map(job => job.trim()))}
                placeholder="Enter related jobs separated by commas..."
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
