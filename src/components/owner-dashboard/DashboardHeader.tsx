
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, User } from "lucide-react";

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

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const displayName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : "Owner";
  
  const handleListProperty = () => {
    navigate("/owner/list-property");
  };
  
  const handleProfileClick = () => {
    navigate("/profile");
  };
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <p className="text-gray-600">Welcome back, {displayName}</p>
      </div>
      <div className="mt-4 md:mt-0 flex gap-3">
        <Button onClick={handleProfileClick} variant="outline" size="sm" className="gap-2">
          <User size={16} />
          Manage Profile
        </Button>
        <Button onClick={handleListProperty} className="bg-care-500 hover:bg-care-600" size="sm">
          <Home className="mr-2 h-4 w-4" />
          List New Property
        </Button>
      </div>
    </div>
  );
}
