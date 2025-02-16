
import { Link } from "react-router-dom";
import { LayoutDashboard, BookOpen, Briefcase, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";

const AdminDashboard = () => {
  const menuItems = [
    {
      title: "Career Pathways",
      description: "Manage career pathways and their requirements",
      icon: BookOpen,
      href: "/admin/pathways"
    },
    {
      title: "Job Roles",
      description: "Manage job roles and their details",
      icon: Briefcase,
      href: "/admin/jobs"
    },
    {
      title: "User Management",
      description: "Manage user roles and permissions",
      icon: Users,
      href: "/admin/users"
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-8">
            <LayoutDashboard className="h-8 w-8 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <Link key={item.title} to={item.href}>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <item.icon className="h-8 w-8 text-primary-600" />
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-gray-600">{item.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
