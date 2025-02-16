
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { JobRole } from "@/types/job";

export type JobFormData = Omit<JobRole, 'id' | 'created_at' | 'updated_at' | 'display_order' | 'career_pathways'>;

export function useJobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_roles")
        .select(`
          *,
          career_pathways(*)
        `)
        .order("display_order", { ascending: true });

      if (error) throw error;

      return data.map(job => ({
        ...job,
        description: typeof job.description === 'string'
          ? { content: job.description }
          : job.description as { content: string },
        resources: job.resources?.map(res =>
          typeof res === 'string' ? { content: res } : res
        ) as { content: string }[] | null,
        related_jobs: job.related_jobs?.map(rel =>
          typeof rel === 'string' ? { content: rel } : rel
        ) as { content: string }[] | null,
        tasks_responsibilities: job.tasks_responsibilities
          ? Object.fromEntries(
              Object.entries(job.tasks_responsibilities).map(([key, value]) => [
                key,
                typeof value === 'string' ? { content: value } : value
              ])
            )
          : null,
      })) as JobRole[];
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
      // For each job, we'll update only its display_order while preserving all other fields
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
