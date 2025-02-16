import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Mail, Phone, Upload, Trash2 } from "lucide-react";
import { useDebounce } from "use-debounce";
import { ImageCropper } from "./ImageCropper";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import { countries, timezones, groupedTimezones, groupedCountries } from "@/lib/profile-utils";

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
  timezone: "America/New_York",
};

export function ProfileSection({ user }: { user: User }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [tempImageUrl, setTempImageUrl] = useState<string>("");
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
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
    if (!profile || !isInitialLoad) return;

    const currentValues = {
      first_name: debouncedFirstName,
      last_name: debouncedLastName,
      phone_number: debouncedPhoneNumber,
      country: debouncedCountry,
      timezone: debouncedTimezone,
    };

    const originalValues = {
      first_name: profile.first_name || DEFAULT_PROFILE.first_name,
      last_name: profile.last_name || DEFAULT_PROFILE.last_name,
      phone_number: profile.phone_number || DEFAULT_PROFILE.phone_number,
      country: profile.country || DEFAULT_PROFILE.country,
      timezone: profile.timezone || DEFAULT_PROFILE.timezone,
    };

    const valuesMatch = Object.keys(currentValues).every(
      key => currentValues[key as keyof typeof currentValues] === originalValues[key as keyof typeof originalValues]
    );

    if (valuesMatch) {
      setIsInitialLoad(false);
    }
  }, [
    profile,
    debouncedFirstName,
    debouncedLastName,
    debouncedPhoneNumber,
    debouncedCountry,
    debouncedTimezone,
  ]);

  useEffect(() => {
    if (!profile || isInitialLoad) return;

    const currentValues = {
      first_name: debouncedFirstName,
      last_name: debouncedLastName,
      phone_number: debouncedPhoneNumber,
      country: debouncedCountry,
      timezone: debouncedTimezone,
    };

    const originalValues = {
      first_name: profile.first_name || DEFAULT_PROFILE.first_name,
      last_name: profile.last_name || DEFAULT_PROFILE.last_name,
      phone_number: profile.phone_number || DEFAULT_PROFILE.phone_number,
      country: profile.country || DEFAULT_PROFILE.country,
      timezone: profile.timezone || DEFAULT_PROFILE.timezone,
    };

    const hasProfileChanges = Object.keys(currentValues).some(
      key => currentValues[key as keyof typeof currentValues] !== originalValues[key as keyof typeof originalValues]
    );

    if (hasProfileChanges) {
      handleSave();
    }
  }, [
    debouncedFirstName,
    debouncedLastName,
    debouncedPhoneNumber,
    debouncedCountry,
    debouncedTimezone,
  ]);

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
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Avatar image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setTempImageUrl(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCroppedImage = async (blob: Blob) => {
    try {
      setIsLoading(true);
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      
      const filePath = `${user.id}-${Math.random()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      setProfile(prev => prev ? {
        ...prev,
        avatar_url: publicUrl,
      } : null);

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating avatar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

      setProfile(prev => prev ? {
        ...prev,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        country: country,
        timezone: timezone,
        updated_at: new Date().toISOString(),
      } : null);

      if (!isInitialLoad) {
        toast({
          title: "Changes saved",
          description: "Your profile has been updated successfully.",
          duration: 3000,
        });
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = async () => {
    try {
      setIsLoading(true);

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: null,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      setProfile(prev => prev ? {
        ...prev,
        avatar_url: null,
      } : null);
      setTempImageUrl("");
      setIsCropperOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Photo removed",
        description: "Your profile picture has been removed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing photo",
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
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {firstName?.charAt(0)}
                    {lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    <div className="text-center space-y-2">
                      <div className="flex gap-2 justify-center">
                        <Button 
                          variant="outline" 
                          className="max-w-xs"
                          disabled={isLoading}
                          onClick={handleUploadClick}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {isLoading ? "Uploading..." : "Click to upload"}
                        </Button>
                        {profile?.avatar_url && (
                          <Button
                            variant="outline"
                            className="max-w-xs"
                            disabled={isLoading}
                            onClick={handleRemovePhoto}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove photo
                          </Button>
                        )}
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        ref={fileInputRef}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500">
                        JPG, PNG or GIF (max. 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(groupedCountries).map(([group, countryList]) => (
                    <SelectGroup key={group}>
                      <SelectLabel>{group}</SelectLabel>
                      {countryList.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
                        </SelectItem>
                      ))}
                      <SelectSeparator />
                    </SelectGroup>
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
                    <SelectGroup key={group}>
                      <SelectLabel>{group}</SelectLabel>
                      {zones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                      <SelectSeparator />
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <ImageCropper
        imageUrl={tempImageUrl}
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        onCropComplete={handleCroppedImage}
      />
    </div>
  );
}
