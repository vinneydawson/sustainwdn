
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export function ProfileSection({ user }: { user: User }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
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
      if (file.size > 5 * 1024 * 1024) { // 5MB
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
        <h2 className="text-2xl font-bold">Profile</h2>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Edit Profile
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>{fullName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
          </Avatar>
          {isEditing && (
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="w-full max-w-xs"
            />
          )}
        </div>

        <div className="flex-1 space-y-4">
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
              <p className="text-gray-900">{profile?.full_name || "Not set"}</p>
            )}
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
              <Button onClick={handleSave} disabled={isLoading}>
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
