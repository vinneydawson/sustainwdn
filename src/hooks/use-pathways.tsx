
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CareerPathway } from "@/types/job";

export type PathwayFormData = Omit<CareerPathway, 'id' | 'created_at' | 'updated_at'>;

export function usePathways() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pathways, isLoading } = useQuery({
    queryKey: ["pathways"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_pathways")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CareerPathway[];
    },
  });

  const createPathway = useMutation({
    mutationFn: async (newPathway: PathwayFormData) => {
      const { data, error } = await supabase
        .from("career_pathways")
        .insert([{
          ...newPathway,
          description: { content: newPathway.description.content },
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pathways"] });
      toast({
        title: "Success",
        description: "Career pathway created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create career pathway",
        variant: "destructive",
      });
    },
  });

  const updatePathway = useMutation({
    mutationFn: async (pathway: PathwayFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("career_pathways")
        .update({
          ...pathway,
          description: { content: pathway.description.content },
        })
        .eq("id", pathway.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pathways"] });
      toast({
        title: "Success",
        description: "Career pathway updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update career pathway",
        variant: "destructive",
      });
    },
  });

  const deletePathway = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("career_pathways")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pathways"] });
      toast({
        title: "Success",
        description: "Career pathway deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete career pathway",
        variant: "destructive",
      });
    },
  });

  return {
    pathways,
    isLoading,
    createPathway,
    updatePathway,
    deletePathway,
  };
}
