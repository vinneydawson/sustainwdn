
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AdminProvider } from "@/contexts/AdminContext";
import Navigation from "@/components/Navigation";
import Index from "@/pages/Index";
import Explore from "@/pages/Explore";
import PathwayJobs from "@/pages/PathwayJobs";
import JobDetails from "@/pages/JobDetails";
import Resources from "@/pages/Resources";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AdminProvider>
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/pathway/:pathwayId" element={<PathwayJobs />} />
            <Route path="/explore/job/:jobId" element={<JobDetails />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AdminProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
