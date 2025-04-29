
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CurrentBookings from "@/components/dashboard/CurrentBookings";
import SavedProperties from "@/components/dashboard/SavedProperties";
import PaymentHistory from "@/components/dashboard/PaymentHistory";
import useFamilyDashboardData from "@/hooks/useFamilyDashboardData";
import { useIsMobile } from "@/hooks/use-mobile";

const FamilyDashboard = () => {
  const { user } = useAuth();
  const { 
    currentBookings, 
    savedProperties, 
    recentPayments, 
    removeSavedProperty,
    hasCurrentBookings,
    loading 
  } = useFamilyDashboardData();
  const isMobile = useIsMobile();
  
  // Get user's display name from metadata
  const getUserDisplayName = () => {
    if (!user) return '';
    
    // Check if user has metadata with first_name
    if (user.user_metadata && 
        (user.user_metadata.first_name || user.user_metadata.last_name)) {
      const firstName = user.user_metadata.first_name || '';
      const lastName = user.user_metadata.last_name || '';
      return `${firstName} ${lastName}`.trim();
    }
    
    // Fallback to email
    return user.email || 'User';
  };

  // Determine which tab should be default based on booking status
  const defaultTab = hasCurrentBookings ? "current" : "saved";

  return (
    <div className="container py-6 px-3 md:py-8 md:px-4">
      <DashboardHeader displayName={getUserDisplayName()} />

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-6 w-full md:w-auto flex">
          <TabsTrigger 
            value="current" 
            className="flex-1 md:flex-none"
          >
            Current Bookings
          </TabsTrigger>
          <TabsTrigger 
            value="saved"
            className="flex-1 md:flex-none"
          >
            Saved Properties
          </TabsTrigger>
          <TabsTrigger 
            value="payments"
            className="flex-1 md:flex-none"
          >
            Payment History
          </TabsTrigger>
        </TabsList>
        
        {/* Current Bookings Tab */}
        <TabsContent value="current">
          <CurrentBookings bookings={currentBookings} />
        </TabsContent>
        
        {/* Saved Properties Tab */}
        <TabsContent value="saved">
          <SavedProperties 
            properties={savedProperties} 
            onRemoveProperty={removeSavedProperty} 
          />
        </TabsContent>
        
        {/* Payments Tab */}
        <TabsContent value="payments">
          <PaymentHistory payments={recentPayments} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyDashboard;
