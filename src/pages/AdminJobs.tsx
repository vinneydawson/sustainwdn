
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, ChevronLeft } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";

const AdminJobs = () => {
  const { toast } = useToast();
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_roles")
        .select(`
          *,
          career_pathways(title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Career Pathway</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs?.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell className="capitalize">{job.level}</TableCell>
                      <TableCell>{job.career_pathways?.title || "Not assigned"}</TableCell>
                      <TableCell>{job.salary || "Not specified"}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminJobs;
