
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "use-debounce";
import { detectUserCountry, detectUserTimezone } from "@/lib/profile-utils";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  country: string | null;
  timezone: string | null;
  resume_url: string | null;
  updated_at: string | null;
}

export const DEFAULT_PROFILE = {
  first_name: "John",
  last_name: "Doe",
  phone_number: "(555) 555-5555",
  country: "US",
  timezone: detectUserTimezone(),
};

export function useProfile(user: User) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [debouncedFirstName] = useDebounce(firstName, 1000);
  const [debouncedLastName] = useDebounce(lastName, 1000);
  const [debouncedPhoneNumber] = useDebounce(phoneNumber, 1000);
  const [debouncedCountry] = useDebounce(country, 1000);
  const [debouncedTimezone] = useDebounce(timezone, 1000);

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          country: country,
          timezone: timezone,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      });

      if (authError) throw authError;

      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const detectedCountry = await detectUserCountry();
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data as Profile);
        setFirstName(data.first_name || DEFAULT_PROFILE.first_name);
        setLastName(data.last_name || DEFAULT_PROFILE.last_name);
        setPhoneNumber(data.phone_number || DEFAULT_PROFILE.phone_number);
        setCountry(data.country || detectedCountry);
        setTimezone(data.timezone || DEFAULT_PROFILE.timezone);
      } else {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            first_name: DEFAULT_PROFILE.first_name,
            last_name: DEFAULT_PROFILE.last_name,
            phone_number: DEFAULT_PROFILE.phone_number,
            country: detectedCountry,
            timezone: DEFAULT_PROFILE.timezone,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        setFirstName(DEFAULT_PROFILE.first_name);
        setLastName(DEFAULT_PROFILE.last_name);
        setPhoneNumber(DEFAULT_PROFILE.phone_number);
        setCountry(detectedCountry);
        setTimezone(DEFAULT_PROFILE.timezone);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (profile) {
      handleSave();
    }
  }, [
    debouncedFirstName,
    debouncedLastName,
    debouncedPhoneNumber,
    debouncedCountry,
    debouncedTimezone,
  ]);

  return {
    profile,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phoneNumber,
    setPhoneNumber,
    country,
    setCountry,
    timezone,
    setTimezone,
    isLoading,
    handleSave,
  };
}
