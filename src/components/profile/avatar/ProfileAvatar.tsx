
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfileAvatarProps {
  firstName?: string | null;
  lastName?: string | null;
  size?: "sm" | "md" | "lg";
}

export function ProfileAvatar({ firstName, lastName, size = "md" }: ProfileAvatarProps) {
  // Get initials for avatar
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return "U";
  };

  // Determine the size class
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-20 w-20"
  };

  return (
    <Avatar className={`${sizeClasses[size]} border`}>
      <AvatarFallback className="bg-care-100 text-care-800">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}
