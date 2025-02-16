
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAdmin } from "@/contexts/AdminContext";

export const useNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        duration: 2000,
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Base navigation items (always visible)
  const baseNavigation = [
    { name: "Home", href: "/" },
    { name: "Explore Pathways", href: "/explore" },
    { name: "Resources", href: "/resources" },
  ];

  // Add conditional navigation items based on auth state
  const navigation = [
    ...baseNavigation,
    ...(session ? [{ name: "Dashboard", href: "/dashboard" }] : []),
    ...(isAdmin && session ? [{ name: "Admin", href: "/admin" }] : []),
  ];

  return {
    isOpen,
    setIsOpen,
    session,
    isLoading,
    navigation,
    handleSignOut,
  };
};
