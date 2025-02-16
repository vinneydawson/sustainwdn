
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AvatarUploadProps {
  user: User;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  onAvatarUpdate: () => void;
}

export function AvatarUpload({ user, firstName, lastName, avatarUrl, onAvatarUpdate }: AvatarUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

        onAvatarUpdate();
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

  return (
    <div className="flex items-center gap-6">
      <Avatar className="h-16 w-16">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback>
          {firstName?.charAt(0)}
          {lastName?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
          <div className="text-center">
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <Button variant="outline" className="w-full max-w-xs" disabled={isLoading}>
                {isLoading ? "Uploading..." : "Click to upload"}
              </Button>
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-upload"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-2">
              SVG, PNG, JPG or GIF (max. 800x400px)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
