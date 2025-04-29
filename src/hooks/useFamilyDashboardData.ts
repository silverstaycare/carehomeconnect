
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
    // Mock data loading - in a real app, this would fetch from an API
    setCurrentBookings([
      {
        id: "b1",
        propertyId: "1",
        propertyName: "Sunshine Senior Care",
        location: "San Francisco, CA",
        image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
        startDate: "2023-01-15",
        monthlyPayment: 2800,
        nextPaymentDate: "2023-05-01",
        resident: "Martha Johnson"
      }
    ]);

    setSavedProperties([
      {
        id: "2",
        name: "Golden Years Manor",
        location: "Los Angeles, CA",
        price: 3200,
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be"
      },
      {
        id: "3",
        name: "Serenity Care Home",
        location: "Seattle, WA",
        price: 2950,
        image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09"
      }
    ]);

    setRecentPayments([
      {
        id: "p1",
        amount: 2800,
        date: "2023-04-01",
        property: "Sunshine Senior Care",
        status: "successful"
      },
      {
        id: "p2",
        amount: 2800,
        date: "2023-03-01",
        property: "Sunshine Senior Care",
        status: "successful"
      }
    ]);

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
