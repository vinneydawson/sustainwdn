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
    // Transform resources and certificates into the required format
    const formattedResources = resources.map(r => ({
      content: `${r.url}|${r.text}`
    }));
    
    const formattedCertificates = certificates.map(c => `${c.url}|${c.text}`);

    const updatedData = {
      ...data,
      resources: formattedResources,
      certificates_degrees: {
        ...data.certificates_degrees,
        certificates: formattedCertificates
      }
    };

    onSubmit(updatedData);
    onOpenChange(false);
  };

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
