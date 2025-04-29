
import { Button } from "@/components/ui/button";
import { Edit, Save, X } from "lucide-react";

interface PropertyEditButtonProps {
  isOwner: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const PropertyEditButton = ({ 
  isOwner, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel 
}: PropertyEditButtonProps) => {
  if (!isOwner) return null;

  return (
    <div className="flex justify-end mb-4">
      {isEditing ? (
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            Save All Changes
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Property
        </Button>
      )}
    </div>
  );
};

export default PropertyEditButton;
