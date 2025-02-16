
export interface JobRole {
  id: string;
  pathway_id: string;
  title: string;
  description: {
    content: string;
  };
  level: string;
  certificates_degrees: {
    education?: string[];
    certificates?: string[];
    experience?: string[];
  } | null;
  tasks_responsibilities: Record<string, { content: string }> | null;
  licenses: string[] | null;
  job_projections: string[] | null;
  resources: { content: string; }[] | null;
  related_jobs: { content: string; }[] | null;
  salary: string | null;
  projections: string | null;
  career_pathways: CareerPathway;
}

export interface CareerPathway {
  id: string;
  title: string;
  description: {
    content: string;
  };
  icon: string;
  created_at: string;
  updated_at: string;
  requirements: { content: string; }[] | null;
  salary_range: string | null;
  skills: string[] | null;
}
