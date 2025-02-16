
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Mail, Phone, Globe, MapPin, Briefcase } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  country: string | null;
  timezone: string | null;
  role: string | null;
}

export function ProfileSection({ user }: { user: User }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [role, setRole] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setBio(data.bio || "");
        setPhoneNumber(data.phone_number || "");
        setCountry(data.country || "");
        setTimezone(data.timezone || "");
        setRole(data.role || "");
      } else {
        // If no profile exists, create one
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({ id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;

        // Fetch the newly created profile
        const { data: newProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (newProfile) {
          setProfile(newProfile);
          setFullName(newProfile.full_name || "");
          setBio(newProfile.bio || "");
          setPhoneNumber(newProfile.phone_number || "");
          setCountry(newProfile.country || "");
          setTimezone(newProfile.timezone || "");
          setRole(newProfile.role || "");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive",
      });
    }
  }

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
      setAvatarFile(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          bio: bio,
          avatar_url: avatarUrl,
          phone_number: phoneNumber,
          country: country,
          timezone: timezone,
          role: role,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      setIsEditing(false);
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
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Profile Information</h2>
          <p className="text-gray-600">Update your profile information</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Avatar */}
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>{fullName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
          </Avatar>
          {isEditing && (
            <div className="w-full">
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-2">
                JPG, GIF or PNG. Max size of 5MB.
              </p>
            </div>
          )}
        </div>

        {/* Middle column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              {isEditing ? (
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="flex items-center">
                  <p className="text-gray-900">{profile?.full_name || "Not set"}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-2" />
                <p className="text-gray-900">{user.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              {isEditing ? (
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-2" />
                  <p className="text-gray-900">{profile?.phone_number || "Not set"}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              {isEditing ? (
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Enter your country"
                />
              ) : (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <p className="text-gray-900">{profile?.country || "Not set"}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              {isEditing ? (
                <Input
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="Enter your timezone"
                />
              ) : (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 text-gray-500 mr-2" />
                  <p className="text-gray-900">{profile?.timezone || "Not set"}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              {isEditing ? (
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Enter your role"
                />
              ) : (
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                  <p className="text-gray-900">{profile?.role || "Not set"}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            {isEditing ? (
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                className="min-h-[100px]"
              />
            ) : (
              <p className="text-gray-900">{profile?.bio || "No bio yet"}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-4">
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
