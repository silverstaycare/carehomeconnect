import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Save, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useProfileData } from "@/hooks/useProfileData";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { formatPhoneDisplay } from "@/utils/formatters";

interface ProfileInfoTabProps {
  user: any;
  onProfileUpdated?: () => Promise<void>;
}

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phone: string;
}

export function ProfileInfoTab({ user, onProfileUpdated }: ProfileInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { profile, isLoading, updateProfile } = useProfileData(user?.id);

  // Set up form with default values from profile
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: profile?.first_name || "",
      lastName: profile?.last_name || "",
      phone: profile?.phone || ""
    }
  });

  // Update form values when profile changes
  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        phone: profile.phone || ""
      });
    }
  }, [profile, form]);

  // Toggle edit mode
  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're currently editing, cancel edit mode
      setIsEditing(false);
      // Reset form to original values
      form.reset({
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        phone: profile?.phone || ""
      });
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

  // Formatted display name
  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return "Your Name";
  };

  // Get initials for avatar
  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return "U";
  };

  return (
    <div className="space-y-6">
      {/* Header with Edit/Save Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profile</h2>
        <Button 
          variant="default" 
          size="sm" 
          onClick={isEditing ? form.handleSubmit(handleSaveProfile) : handleToggleEdit} 
          className="flex items-center gap-1"
          disabled={isLoading}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4" />
              Save
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              Edit
            </>
          )}
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <Card className="border-0 shadow-none">
          <CardContent className="px-0 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border">
                <AvatarFallback className="bg-care-100 text-care-800">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{getFullName()}</h3>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>

            {isEditing ? (
              <Form {...form}>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <label className="text-sm text-gray-500">First Name</label>
                          <FormControl>
                            <Input {...field} placeholder="First Name" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <label className="text-sm text-gray-500">Last Name</label>
                          <FormControl>
                            <Input {...field} placeholder="Last Name" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <label className="text-sm text-gray-500">Phone</label>
                          <FormControl>
                            <Input {...field} placeholder="Phone Number" type="tel" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="font-medium mt-2">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-sm text-gray-500">Account Type</label>
                      <p className="font-medium mt-1 capitalize">{profile?.role || "User"}</p>
                    </div>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{getFullName()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user?.email}</p>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
