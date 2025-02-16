
import type { ResourceLink } from "./types";
import type { JobFormData } from "@/hooks/use-jobs";
import type { JobRole } from "@/types/job";

export function initializeResources(resources?: { content: string }[] | null): ResourceLink[] {
  if (!resources) return [];
  
  return resources.map(r => {
    try {
      const parts = r.content.split('|');
      return { url: parts[0], text: parts[1] || parts[0] };
    } catch {
      return { url: r.content, text: r.content };
    }
  });
}

export function formatFormData(
  data: JobFormData,
  resources: ResourceLink[],
  certificates: ResourceLink[],
  relatedJobs: string[]
) {
  const formattedResources = resources.map(r => ({
    content: `${r.url}|${r.text}`
  }));
  
  const formattedCertificates = certificates.map(c => `${c.url}|${c.text}`);

  const taskContent = data.tasks_responsibilities?.task_1?.content || "";
  const formattedTasks = {
    task_1: { content: taskContent }
  };

  const experienceContent = data.certificates_degrees?.experience || [];
  const formattedExperience = Array.isArray(experienceContent) 
    ? experienceContent 
    : [experienceContent];

  const formattedRelatedJobs = relatedJobs.map(job => ({
    content: job
  }));

  return {
    ...data,
    resources: formattedResources,
    tasks_responsibilities: formattedTasks,
    related_jobs: formattedRelatedJobs,
    certificates_degrees: {
      ...data.certificates_degrees,
      certificates: formattedCertificates,
      experience: formattedExperience,
    }
  };
}

export function getInitialFormValues(initialData?: JobRole): JobFormData {
  return {
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
    tasks_responsibilities: initialData?.tasks_responsibilities || { task_1: { content: "" } },
    resources: initialData?.resources || [],
    related_jobs: initialData?.related_jobs || [],
    projections: initialData?.projections || "",
  };
}
