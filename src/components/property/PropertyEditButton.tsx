
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
    <div>
      {isEditing ? (
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} size="sm">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={onSave} size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={onEdit} size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Edit Property
        </Button>
      )}
    </div>
  );
};

export default PropertyEditButton;
