
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronLeft } from "lucide-react";
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

const AdminPathways = () => {
  const { toast } = useToast();
  const { data: pathways, isLoading } = useQuery({
    queryKey: ["pathways"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_pathways")
        .select("*")
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
              <BookOpen className="h-8 w-8 text-primary-600" />
              <h1 className="text-4xl font-bold text-gray-900 text-left">Career Pathways</h1>
            </div>
            <Button variant="default" className="bg-primary-600 hover:bg-primary-700">
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
                      <TableCell className="text-left">
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

export default AdminPathways;
