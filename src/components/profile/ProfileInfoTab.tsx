
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { useProfileData } from "@/hooks/useProfileData";
import { ProfileAvatar } from "./avatar/ProfileAvatar";
import { ProfileEditForm, ProfileFormValues } from "./form/ProfileEditForm";
import { ProfileInfoDisplay } from "./display/ProfileInfoDisplay";
import { ProfileHeader } from "./header/ProfileHeader";

interface ProfileInfoTabProps {
  user: any;
  onProfileUpdated?: () => Promise<void>;
}

export function ProfileInfoTab({ user, onProfileUpdated }: ProfileInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { profile, isLoading, updateProfile } = useProfileData(user?.id);
  
  // Formatted display name
  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return "Your Name";
  };

  // Toggle edit mode
  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're currently editing, cancel edit mode
      setIsEditing(false);
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  };

  // Handle saving profile changes
  const handleSaveProfile = async (data: ProfileFormValues) => {
    const formattedData = {
      displayName: `${data.firstName} ${data.lastName}`,
      phone: data.phone
    };
    
    const success = await updateProfile(formattedData);
    
    if (success && onProfileUpdated) {
      await onProfileUpdated();
      setIsEditing(false);
    }
  };

  // Form default values
  const getFormDefaults = () => ({
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
    phone: profile?.phone || "",
    email: user?.email
  });

  return (
    <div className="space-y-6">
      {/* Header with Edit/Save Button */}
      <ProfileHeader 
        isEditing={isEditing} 
        isLoading={isLoading} 
        onToggleEdit={handleToggleEdit}
        onSave={() => {
          const formData = {
            firstName: profile?.first_name || "",
            lastName: profile?.last_name || "",
            phone: profile?.phone || ""
          };
          handleSaveProfile(formData);
        }}
      />

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <Card className="border-0 shadow-none">
          <CardContent className="px-0 space-y-6">
            <div className="flex items-center gap-4">
              <ProfileAvatar 
                firstName={profile?.first_name} 
                lastName={profile?.last_name}
              />
              <div>
                <h3 className="text-lg font-medium">{getFullName()}</h3>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>

            {isEditing ? (
              <ProfileEditForm 
                defaultValues={getFormDefaults()}
                onSubmit={handleSaveProfile}
              />
            ) : (
              <ProfileInfoDisplay 
                profile={profile}
                email={user?.email}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
