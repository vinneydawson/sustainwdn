
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, ChevronLeft } from "lucide-react";
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

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  role: string;
}

const AdminUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // Get the current user's role to verify admin status
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: currentUserRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (currentUserRole?.role !== "admin") {
        throw new Error("Not authorized");
      }

      // Get user roles with their corresponding profiles in a single query
      const { data: userRolesWithProfiles, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          profiles!user_roles_user_id_profiles_fkey(
            first_name,
            last_name,
            email,
            phone_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data into the expected format
      return userRolesWithProfiles.map((item) => ({
        id: item.user_id,
        first_name: item.profiles?.first_name || '',
        last_name: item.profiles?.last_name || '',
        email: item.profiles?.email || 'No email provided',
        phone_number: item.profiles?.phone_number || '',
        role: item.role,
      }));
    },
  });

  const toggleRole = useMutation({
    mutationFn: async (userId: string) => {
      setIsLoading(true);
      const { data: currentRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      const newRole = currentRole?.role === "admin" ? "user" : "admin";

      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;
      return { userId, newRole };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
      setIsLoading(false);
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

          <div className="flex items-center gap-3 mb-8">
            <Users className="h-8 w-8 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
          </div>

          <Card className="p-6">
            {isLoadingUsers ? (
              <div>Loading users...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.first_name || user.last_name 
                          ? `${user.first_name || ''} ${user.last_name || ''}`
                          : 'No name provided'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone_number || 'No phone provided'}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-primary-100 text-primary-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleRole.mutate(user.id)}
                          disabled={isLoading}
                        >
                          {user.role === "admin"
                            ? "Remove Admin"
                            : "Make Admin"}
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

export default AdminUsers;
