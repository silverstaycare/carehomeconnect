
import { useState, useEffect } from "react";
import { Booking } from "@/components/dashboard/CurrentBookings";
import { SavedProperty } from "@/components/dashboard/SavedProperties";
import { Payment } from "@/components/dashboard/PaymentHistory";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// This hook centralizes all data fetching and state management for the family dashboard
const useFamilyDashboardData = () => {
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with empty arrays instead of mock data
    setCurrentBookings([]);
    setSavedProperties([]);
    setRecentPayments([]);
    setLoading(false);
  }, []);

  // Function to save a property
  const saveProperty = async (property: {
    id: string;
    name: string;
    location: string;
    price: number;
    image: string;
  }) => {
    try {
      // In a real app, this would save to the database
      // For now we'll just update the local state
      setSavedProperties(prev => {
        // Check if property is already saved
        if (prev.some(p => p.id === property.id)) {
          toast({
            title: "Property already saved",
            description: "This property is already in your saved list."
          });
          return prev; // Return unchanged list if already saved
        }
        
        // Add to saved properties
        toast({
          title: "Property saved",
          description: "The property has been added to your saved list."
        });
        return [...prev, property];
      });

      return true;
    } catch (error) {
      console.error("Error saving property:", error);
      toast({
        title: "Error saving property",
        description: "There was an error saving this property. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Function to remove a property from saved properties
  const removeSavedProperty = (id: string) => {
    setSavedProperties(savedProperties.filter(property => property.id !== id));
  };

  return {
    currentBookings,
    savedProperties,
    recentPayments,
    loading,
    saveProperty,
    removeSavedProperty,
    hasCurrentBookings: currentBookings.length > 0
  };
};

export default useFamilyDashboardData;
