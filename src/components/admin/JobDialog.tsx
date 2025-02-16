
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, X } from "lucide-react";
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

interface ResourceLink {
  url: string;
  text: string;
}

export function JobDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: JobDialogProps) {
  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [certificates, setCertificates] = useState<ResourceLink[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [relatedJobs, setRelatedJobs] = useState<string[]>([]);

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
      resources: initialData?.resources || [],
      related_jobs: initialData?.related_jobs || [],
      projections: initialData?.projections || "",
    },
  });

  const { pathways } = usePathways();
  const selectedPathwayId = watch("pathway_id");

  useEffect(() => {
    if (open) {
      // Initialize resources from initialData
      if (initialData?.resources) {
        const parsedResources = initialData.resources.map(r => {
          try {
            const parts = r.content.split('|');
            return { url: parts[0], text: parts[1] || parts[0] };
          } catch {
            return { url: r.content, text: r.content };
          }
        });
        setResources(parsedResources);
      } else {
        setResources([]);
      }

      // Initialize certificates from initialData
      if (initialData?.certificates_degrees?.certificates) {
        const parsedCertificates = initialData.certificates_degrees.certificates.map(c => {
          try {
            const parts = c.split('|');
            return { url: parts[0], text: parts[1] || parts[0] };
          } catch {
            return { url: c, text: c };
          }
        });
        setCertificates(parsedCertificates);
      } else {
        setCertificates([]);
      }

      // Initialize tasks from initialData
      if (initialData?.tasks_responsibilities) {
        setTasks(Object.values(initialData.tasks_responsibilities).map(t => t.content));
      } else {
        setTasks([]);
      }

      // Initialize related jobs from initialData
      if (initialData?.related_jobs) {
        setRelatedJobs(initialData.related_jobs.map(j => j.content));
      } else {
        setRelatedJobs([]);
      }

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
        resources: initialData?.resources || [],
        related_jobs: initialData?.related_jobs || [],
        projections: initialData?.projections || "",
      });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: JobFormData) => {
    // Transform resources and certificates into the required format
    const formattedResources = resources.map(r => ({
      content: `${r.url}|${r.text}`
    }));
    
    const formattedCertificates = certificates.map(c => `${c.url}|${c.text}`);

    // Transform tasks into the required format
    const formattedTasks = tasks.reduce((acc, task, index) => {
      acc[`task_${index + 1}`] = { content: task };
      return acc;
    }, {} as Record<string, { content: string }>);

    // Transform related jobs into the required format
    const formattedRelatedJobs = relatedJobs.map(job => ({
      content: job
    }));

    const updatedData = {
      ...data,
      resources: formattedResources,
      tasks_responsibilities: formattedTasks,
      related_jobs: formattedRelatedJobs,
      certificates_degrees: {
        ...data.certificates_degrees,
        certificates: formattedCertificates
      }
    };

    onSubmit(updatedData);
    onOpenChange(false);
  };

  // Resource management functions
  const addResource = () => {
    setResources([...resources, { url: "", text: "" }]);
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const updateResource = (index: number, field: keyof ResourceLink, value: string) => {
    const updatedResources = [...resources];
    updatedResources[index] = { ...updatedResources[index], [field]: value };
    setResources(updatedResources);
  };

  // Certificate management functions
  const addCertificate = () => {
    setCertificates([...certificates, { url: "", text: "" }]);
  };

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  const updateCertificate = (index: number, field: keyof ResourceLink, value: string) => {
    const updatedCertificates = [...certificates];
    updatedCertificates[index] = { ...updatedCertificates[index], [field]: value };
    setCertificates(updatedCertificates);
  };

  // Tasks management functions
  const addTask = () => {
    setTasks([...tasks, ""]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, value: string) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = value;
    setTasks(updatedTasks);
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
              <Label>Tasks + Responsibilities</Label>
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Textarea
                        value={task}
                        onChange={(e) => updateTask(index, e.target.value)}
                        placeholder="Enter task..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeTask(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTask}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
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

            <div className="grid gap-2">
              <Label>Certificates</Label>
              <div className="space-y-4">
                {certificates.map((certificate, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="URL"
                        value={certificate.url}
                        onChange={(e) => updateCertificate(index, 'url', e.target.value)}
                      />
                      <Input
                        placeholder="Display Text"
                        value={certificate.text}
                        onChange={(e) => updateCertificate(index, 'text', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeCertificate(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCertificate}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certificate
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="experience">Work Experience</Label>
              <Textarea
                id="experience"
                {...register("certificates_degrees.experience")}
                placeholder="Enter required work experience..."
                className="min-h-[100px]"
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
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-2">
              <Label>Resources</Label>
              <div className="space-y-4">
                {resources.map((resource, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="URL"
                        value={resource.url}
                        onChange={(e) => updateResource(index, 'url', e.target.value)}
                      />
                      <Input
                        placeholder="Display Text"
                        value={resource.text}
                        onChange={(e) => updateResource(index, 'text', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeResource(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addResource}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </div>
            </div>

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
