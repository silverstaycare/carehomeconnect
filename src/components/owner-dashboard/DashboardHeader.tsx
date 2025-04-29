
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Pencil } from "lucide-react";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

interface DashboardHeaderProps {
  profile: UserProfile | null;
  onProfileUpdated: () => void;
}

export function DashboardHeader({ profile, onProfileUpdated }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const displayName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : "Owner";
  
  const handleListProperty = () => {
    navigate("/owner/list-property");
  };
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <p className="text-gray-600">Welcome back, {displayName}</p>
      </div>
      <div className="mt-4 md:mt-0 flex gap-3">
        {profile && (
          <EditProfileDialog 
            userId={profile.id}
            firstName={profile.first_name || ""}
            lastName={profile.last_name || ""}
            phone={profile.phone || ""}
            onProfileUpdated={onProfileUpdated}
          />
        )}
        <Button onClick={handleListProperty} className="bg-care-500 hover:bg-care-600">
          <Home className="mr-2 h-4 w-4" />
          List New Property
        </Button>
      </div>
    </div>
  );
}
