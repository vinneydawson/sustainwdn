
import { useState, useEffect, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "use-debounce";

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
  country: "",
  timezone: "",
};

export function useProfile(user: User) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const previousValuesRef = useRef({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    country: "",
    timezone: "",
  });

  const [debouncedFirstName] = useDebounce(firstName, 1000);
  const [debouncedLastName] = useDebounce(lastName, 1000);
  const [debouncedPhoneNumber] = useDebounce(phoneNumber, 1000);
  const [debouncedCountry] = useDebounce(country, 1000);
  const [debouncedTimezone] = useDebounce(timezone, 1000);

  const handleSave = async (showToast = true) => {
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

      if (showToast) {
        toast({
          title: "Profile updated",
          description: "Your changes have been saved.",
        });
      }

      const { data: updatedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (updatedProfile) {
        setProfile(updatedProfile as Profile);
      }
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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data as Profile);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhoneNumber(data.phone_number || "");
        setCountry(data.country || "");
        setTimezone(data.timezone || "");
        
        // Update previous values
        previousValuesRef.current = {
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          phoneNumber: data.phone_number || "",
          country: data.country || "",
          timezone: data.timezone || "",
        };
      } else {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            first_name: DEFAULT_PROFILE.first_name,
            last_name: DEFAULT_PROFILE.last_name,
            phone_number: DEFAULT_PROFILE.phone_number,
            country: DEFAULT_PROFILE.country,
            timezone: DEFAULT_PROFILE.timezone,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        setFirstName(DEFAULT_PROFILE.first_name);
        setLastName(DEFAULT_PROFILE.last_name);
        setPhoneNumber(DEFAULT_PROFILE.phone_number);
        setCountry(DEFAULT_PROFILE.country);
        setTimezone(DEFAULT_PROFILE.timezone);
        
        // Update previous values with defaults
        previousValuesRef.current = {
          firstName: DEFAULT_PROFILE.first_name,
          lastName: DEFAULT_PROFILE.last_name,
          phoneNumber: DEFAULT_PROFILE.phone_number,
          country: DEFAULT_PROFILE.country,
          timezone: DEFAULT_PROFILE.timezone,
        };
      }
      setHasLoaded(true);
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
    if (!hasLoaded) return;
    
    const valueChanged = 
      debouncedFirstName !== previousValuesRef.current.firstName ||
      debouncedLastName !== previousValuesRef.current.lastName ||
      debouncedPhoneNumber !== previousValuesRef.current.phoneNumber ||
      debouncedCountry !== previousValuesRef.current.country ||
      debouncedTimezone !== previousValuesRef.current.timezone;

    if (valueChanged) {
      previousValuesRef.current = {
        firstName: debouncedFirstName,
        lastName: debouncedLastName,
        phoneNumber: debouncedPhoneNumber,
        country: debouncedCountry,
        timezone: debouncedTimezone,
      };
      handleSave(true);
    }
  }, [
    hasLoaded,
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
