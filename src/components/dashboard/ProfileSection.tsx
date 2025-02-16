import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Mail, Phone } from "lucide-react";
import { useDebounce } from "use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import { countries, timezones, detectUserTimezone } from "@/lib/profile-utils";

interface Profile {
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

const DEFAULT_PROFILE = {
  first_name: "John",
  last_name: "Doe",
  phone_number: "(555) 555-5555",
  country: "US",
  timezone: detectUserTimezone(),
};

export function ProfileSection({ user }: { user: User }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [debouncedFirstName] = useDebounce(firstName, 1000);
  const [debouncedLastName] = useDebounce(lastName, 1000);
  const [debouncedPhoneNumber] = useDebounce(phoneNumber, 1000);
  const [debouncedCountry] = useDebounce(country, 1000);
  const [debouncedTimezone] = useDebounce(timezone, 1000);

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

  async function fetchProfile() {
    try {
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
        setCountry(data.country || DEFAULT_PROFILE.country);
        setTimezone(data.timezone || DEFAULT_PROFILE.timezone);
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
      }
    } catch (error: any) {
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 800 * 400) {
        toast({
          title: "File too large",
          description: "Avatar image must be less than 800x400px",
          variant: "destructive",
        });
        return;
      }
      setAvatarFile(file);
      
      try {
        setIsLoading(true);
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
          });

        await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        });

        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully.",
        });

        fetchProfile();
      } catch (error: any) {
        toast({
          title: "Error updating avatar",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-2">Profile Information</h2>

      <div className="space-y-8">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500">
              Update your photo and personal details here.
            </p>
          </div>

          <div className="grid gap-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
              <Label htmlFor="firstName">
                Name <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="firstName"
                  placeholder={DEFAULT_PROFILE.first_name}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  id="lastName"
                  placeholder={DEFAULT_PROFILE.last_name}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
              <Label htmlFor="email">
                Email address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  readOnly
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
              <Label htmlFor="phone">Phone number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder={DEFAULT_PROFILE.phone_number}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
              <div>
                <Label>
                  Your photo <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500">
                  This will be displayed on your profile.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>
                    {firstName?.charAt(0)}
                    {lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <Button variant="outline" className="w-full max-w-xs">
                          Click to upload
                        </Button>
                      </label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        SVG, PNG, JPG or GIF (max. 800x400px)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a timezone" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(groupedTimezones).map(([group, zones]) => (
                    <div key={group}>
                      <SelectLabel>{group}</SelectLabel>
                      {zones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                      <SelectSeparator />
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
