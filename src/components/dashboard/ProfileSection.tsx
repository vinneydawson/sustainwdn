
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

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  country: string | null;
  timezone: string | null;
  role: string | null;
  resume_url: string | null;
  updated_at: string | null;
}

export function ProfileSection({ user }: { user: User }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [role, setRole] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Debounce all form values to avoid too many updates
  const [debouncedFirstName] = useDebounce(firstName, 1000);
  const [debouncedLastName] = useDebounce(lastName, 1000);
  const [debouncedPhoneNumber] = useDebounce(phoneNumber, 1000);
  const [debouncedCountry] = useDebounce(country, 1000);
  const [debouncedTimezone] = useDebounce(timezone, 1000);
  const [debouncedRole] = useDebounce(role, 1000);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Effect to auto-save when debounced values change
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
    debouncedRole,
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
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhoneNumber(data.phone_number || "");
        setCountry(data.country || "");
        setTimezone(data.timezone || "");
        setRole(data.role || "");
      } else {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({ id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
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
      
      // Auto-upload avatar when selected
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

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          country: country,
          timezone: timezone,
          role: role,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

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
                  placeholder="Vinney"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  id="lastName"
                  placeholder="Dawson"
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
                  placeholder="(310) 200-8101"
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
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                placeholder="Lead Designer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="United States"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                placeholder="Pacific Standard Time (PST)"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
