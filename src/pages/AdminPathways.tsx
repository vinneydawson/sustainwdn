
import { useState } from "react";
import { BookOpen, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { PathwayDialog } from "@/components/admin/PathwayDialog";
import { PathwaysTable } from "@/components/admin/PathwaysTable";
import { usePathways, type PathwayFormData } from "@/hooks/use-pathways";
import type { CareerPathway } from "@/types/job";

const AdminPathways = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<CareerPathway | null>(null);
  const { 
    pathways, 
    isLoading, 
    createPathway, 
    updatePathway, 
    deletePathway,
    reorderPathways,
  } = usePathways();

  const handleSubmit = (data: PathwayFormData) => {
    if (selectedPathway) {
      updatePathway.mutate({ ...data, id: selectedPathway.id });
    } else {
      createPathway.mutate(data);
    }
    setDialogOpen(false);
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

  const handleReorder = (reorderedPathways: CareerPathway[]) => {
    reorderPathways.mutate(reorderedPathways);
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
              <PathwaysTable
                pathways={pathways || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReorder={handleReorder}
              />
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
