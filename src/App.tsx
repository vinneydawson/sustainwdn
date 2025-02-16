
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminProvider } from "@/contexts/AdminContext";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/Navigation";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Explore from "@/pages/Explore";
import Resources from "@/pages/Resources";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminPathways from "@/pages/AdminPathways";
import AdminJobs from "@/pages/AdminJobs";
import JobDetails from "@/pages/JobDetails";
import PathwayJobs from "@/pages/PathwayJobs";

import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AdminProvider>
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/pathway/:id" element={<PathwayJobs />} />
            <Route path="/explore/job/:id" element={<JobDetails />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/pathways" element={<AdminPathways />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AdminProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
