
import { User } from "@supabase/supabase-js";
import { Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { groupedCountries, groupedTimezones } from "@/lib/profile-utils";
import { useProfile } from "@/hooks/useProfile";
import { AvatarUpload } from "./AvatarUpload";

export function ProfileSection({ user }: { user: User }) {
  const {
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
    handleSave: fetchProfile,
  } = useProfile(user);

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
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  id="lastName"
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
              <AvatarUpload
                user={user}
                firstName={firstName}
                lastName={lastName}
                avatarUrl={profile?.avatar_url}
                onAvatarUpdate={fetchProfile}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
              <Label htmlFor="country">Country</Label>
              <Select value={country || undefined} onValueChange={setCountry}>
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
              <Select value={timezone || undefined} onValueChange={setTimezone}>
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
    </div>
  );
}
