
import { useState } from "react";
import { Briefcase, ChevronLeft } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { JobsTable } from "@/components/admin/JobsTable";
import { useJobs } from "@/hooks/use-jobs";
import type { JobRole } from "@/types/job";

const AdminJobs = () => {
  const [selectedJob, setSelectedJob] = useState<JobRole | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { jobs, isLoading, deleteJob, reorderJobs } = useJobs();

  const handleEdit = (job: JobRole) => {
    setSelectedJob(job);
    // TODO: Implement job edit dialog
  };

  const handleDelete = (job: JobRole) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedJob) {
      deleteJob.mutate(selectedJob.id);
      setDeleteDialogOpen(false);
      setSelectedJob(null);
    }
  };

  const handleReorder = (reorderedJobs: JobRole[]) => {
    reorderJobs.mutate(reorderedJobs);
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
              <Briefcase className="h-8 w-8 text-primary-600" />
              <h1 className="text-4xl font-bold text-gray-900">Job Roles</h1>
            </div>
            <Button variant="default" className="bg-primary-600 hover:bg-primary-700">
              Add Job Role
            </Button>
          </div>

          <Card className="p-6">
            {isLoading ? (
              <div>Loading jobs...</div>
            ) : (
              <JobsTable
                jobs={jobs || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReorder={handleReorder}
              />
            )}
          </Card>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  job role and remove it from all related pages.
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

export default AdminJobs;
