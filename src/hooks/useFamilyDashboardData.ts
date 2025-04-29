
import { useState, useEffect } from "react";
import { Booking } from "@/components/dashboard/CurrentBookings";
import { SavedProperty } from "@/components/dashboard/SavedProperties";
import { Payment } from "@/components/dashboard/PaymentHistory";

// This hook centralizes all data fetching and state management for the family dashboard
const useFamilyDashboardData = () => {
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize with empty arrays instead of mock data
    setCurrentBookings([]);
    setSavedProperties([]);
    setRecentPayments([]);
    setLoading(false);
  }, []);

  // Function to remove a property from saved properties
  const removeSavedProperty = (id: string) => {
    setSavedProperties(savedProperties.filter(property => property.id !== id));
  };

  return {
    currentBookings,
    savedProperties,
    recentPayments,
    loading,
    removeSavedProperty
  };
};

export default useFamilyDashboardData;
