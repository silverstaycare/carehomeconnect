
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CurrentBookings from "@/components/dashboard/CurrentBookings";
import SavedProperties from "@/components/dashboard/SavedProperties";
import PaymentHistory from "@/components/dashboard/PaymentHistory";
import useFamilyDashboardData from "@/hooks/useFamilyDashboardData";

const FamilyDashboard = () => {
  const { user } = useAuth();
  const { currentBookings, savedProperties, recentPayments, removeSavedProperty } = useFamilyDashboardData();
  
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

  return (
    <div className="container py-8 px-4">
      <DashboardHeader displayName={getUserDisplayName()} />

      <Tabs defaultValue="current">
        <TabsList className="mb-8">
          <TabsTrigger value="current">Current Bookings</TabsTrigger>
          <TabsTrigger value="saved">Saved Properties</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
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
