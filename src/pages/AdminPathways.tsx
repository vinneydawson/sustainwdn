
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, ChevronLeft, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { PathwayDialog } from "@/components/admin/PathwayDialog";
import { supabase } from "@/integrations/supabase/client";
import type { CareerPathway } from "@/types/job";

const AdminPathways = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<CareerPathway | null>(null);

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
    mutationFn: async (newPathway: Partial<CareerPathway>) => {
      const { data, error } = await supabase
        .from("career_pathways")
        .insert([newPathway])
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
    mutationFn: async ({ id, ...pathway }: Partial<CareerPathway>) => {
      const { data, error } = await supabase
        .from("career_pathways")
        .update(pathway)
        .eq("id", id)
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

  const handleSubmit = (data: Partial<CareerPathway>) => {
    if (selectedPathway) {
      updatePathway.mutate({ ...data, id: selectedPathway.id });
    } else {
      createPathway.mutate(data);
    }
  };

  const handleEdit = (pathway: CareerPathway) => {
    setSelectedPathway(pathway);
    setDialogOpen(true);
  };

  const handleDelete = (pathway: CareerPathway) => {
    setSelectedPathway(pathway);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPathway) {
      deletePathway.mutate(selectedPathway.id);
      setDeleteDialogOpen(false);
      setSelectedPathway(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center mb-4">
            <Link to="/admin">
              <Button variant="ghost" className="mr-4">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <h1 className="text-4xl font-bold text-gray-900 text-left">Career Pathways</h1>
            </div>
            <Button 
              variant="default" 
              className="bg-primary-600 hover:bg-primary-700"
              onClick={() => {
                setSelectedPathway(null);
                setDialogOpen(true);
              }}
            >
              Add Pathway
            </Button>
          </div>

          <Card className="p-6">
            {isLoading ? (
              <div className="text-left">Loading pathways...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Title</TableHead>
                    <TableHead className="text-left">Skills</TableHead>
                    <TableHead className="text-left">Salary Range</TableHead>
                    <TableHead className="text-left">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pathways?.map((pathway) => (
                    <TableRow key={pathway.id}>
                      <TableCell className="font-medium text-left">{pathway.title}</TableCell>
                      <TableCell className="text-left">{pathway.skills?.join(", ") || "No skills listed"}</TableCell>
                      <TableCell className="text-left">{pathway.salary_range || "Not specified"}</TableCell>
                      <TableCell className="text-left space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(pathway)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(pathway)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          <PathwayDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            initialData={selectedPathway || undefined}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  career pathway and remove it from the explore page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminPathways;
