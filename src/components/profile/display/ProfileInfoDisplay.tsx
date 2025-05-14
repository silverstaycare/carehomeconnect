
import React from "react";
import { formatPhoneDisplay } from "@/utils/formatters";
import { ProfileData } from "@/hooks/useProfileData";

interface ProfileInfoDisplayProps {
  profile: ProfileData | null;
  email?: string | null;
}

export function ProfileInfoDisplay({ profile, email }: ProfileInfoDisplayProps) {
  // Formatted display name
  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return "Your Name";
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Full Name</p>
          <p className="font-medium">{getFullName()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{email}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Phone</p>
          <p className="font-medium">{formatPhoneDisplay(profile?.phone)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Account Type</p>
          <p className="font-medium capitalize">{profile?.role || "User"}</p>
        </div>
      </div>
    </div>
  );
}
