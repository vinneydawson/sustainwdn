import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { JobRole } from "@/types/job";
import type { Json } from "@/integrations/supabase/types";

export type JobFormData = Omit<JobRole, 'id' | 'created_at' | 'updated_at' | 'display_order' | 'career_pathways'>;

function isJsonArray(value: Json): value is Json[] {
  return Array.isArray(value);
}

interface UseJobsOptions {
  pathwayId?: string;
  level?: string;
}

export function useJobs(options: UseJobsOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { pathwayId, level } = options;

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", { pathwayId, level }],
    queryFn: async () => {
      console.log("Fetching jobs with filters:", { pathwayId, level });
      
      let query = supabase
        .from("job_roles")
        .select(`
          *,
          career_pathways(*)
        `)
        .order("display_order", { ascending: true });

      if (pathwayId) {
        query = query.eq("pathway_id", pathwayId);
      }

      if (level) {
        query = query.eq("level", level);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching jobs:", error);
        throw error;
      }

      console.log("Raw jobs data:", data);

      const transformedJobs = data.map(job => ({
        ...job,
        description: typeof job.description === 'string'
          ? { content: job.description }
          : job.description as { content: string },
        resources: isJsonArray(job.resources)
          ? job.resources.map(res => typeof res === 'string' ? { content: res } : res as { content: string })
          : [],
        related_jobs: isJsonArray(job.related_jobs)
          ? job.related_jobs.map(rel => typeof rel === 'string' ? { content: rel } : rel as { content: string })
          : [],
        tasks_responsibilities: job.tasks_responsibilities
          ? Object.fromEntries(
              Object.entries(job.tasks_responsibilities).map(([key, value]) => [
                key,
                typeof value === 'string' ? { content: value } : value
              ])
            )
          : null,
      })) as JobRole[];

      console.log("Transformed jobs data:", transformedJobs);
      return transformedJobs;
    },
  });

  const createJob = useMutation({
    mutationFn: async (newJob: JobFormData) => {
      const maxOrder = jobs?.reduce((max, j) => Math.max(max, j.display_order), 0) || 0;
      
      const { data, error } = await supabase
        .from("job_roles")
        .insert([{
          ...newJob,
          display_order: maxOrder + 1,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: "Success",
        description: "Job role created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create job role",
        variant: "destructive",
      });
    },
  });

  const updateJob = useMutation({
    mutationFn: async (job: JobFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("job_roles")
        .update(job)
        .eq("id", job.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: "Success",
        description: "Job role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update job role",
        variant: "destructive",
      });
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("job_roles")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: "Success",
        description: "Job role deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete job role",
        variant: "destructive",
      });
    },
  });

  const reorderJobs = useMutation({
    mutationFn: async (reorderedJobs: JobRole[]) => {
      for (const [index, job] of reorderedJobs.entries()) {
        const { error } = await supabase
          .from("job_roles")
          .update({ display_order: index + 1 })
          .eq("id", job.id);

        if (error) throw error;
      }
      return reorderedJobs;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: "Success",
        description: "Job order updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update job order",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  return {
    jobs,
    isLoading,
    createJob,
    updateJob,
    deleteJob,
    reorderJobs,
  };
}
