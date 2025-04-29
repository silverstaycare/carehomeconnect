
import { useNavigate } from "react-router-dom";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { PropertiesGrid } from "@/components/owner-dashboard/PropertiesGrid";
import { EmptyState } from "@/components/owner-dashboard/EmptyState";
import { DashboardHeader } from "@/components/owner-dashboard/DashboardHeader";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { properties, profile, isLoading, handleProfileUpdated } = useOwnerProperties();

  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <DashboardHeader 
        profile={profile} 
        onProfileUpdated={handleProfileUpdated} 
      />

      {properties.length === 0 ? (
        <EmptyState />
      ) : (
        <PropertiesGrid properties={properties} />
      )}
    </div>
  );
};

export default OwnerDashboard;
