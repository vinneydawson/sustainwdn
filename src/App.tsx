
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session === null) {
        // Clear query cache when user logs out
        queryClient.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AdminProvider>
          <Navigation />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={
              session ? <Navigate to="/dashboard" replace /> : <Auth />
            } />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/pathway/:pathwayId" element={<PathwayJobs />} />
            <Route path="/explore/job/:id" element={<JobDetails />} />
            <Route path="/resources" element={<Resources />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pathways"
              element={
                <ProtectedRoute>
                  <AdminPathways />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs"
              element={
                <ProtectedRoute>
                  <AdminJobs />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AdminProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
