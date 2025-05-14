
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save } from "lucide-react";

interface ProfileHeaderProps {
  isEditing: boolean;
  isLoading: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
}

export function ProfileHeader({ isEditing, isLoading, onToggleEdit, onSave }: ProfileHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Profile</h2>
      <Button 
        variant="default" 
        size="sm" 
        onClick={isEditing ? onSave : onToggleEdit} 
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
  );
}
