
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface DashboardHeaderProps {
  displayName: string;
}

const DashboardHeader = ({ displayName }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">Family Dashboard</h1>
        <p className="text-gray-600">Welcome back, {displayName}</p>
      </div>
      <div className="mt-4 md:mt-0">
        <Button onClick={() => navigate("/search")}>
          <Search className="mr-2 h-4 w-4" />
          Find Care Homes
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
