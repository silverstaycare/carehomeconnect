
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface SubscriptionSummaryCardProps {
  pricePerBed: number;
  onSubscribeClick: () => void;
}

export function SubscriptionSummaryCard({ 
  pricePerBed, 
  onSubscribeClick 
}: SubscriptionSummaryCardProps) {
  const { properties } = useOwnerProperties();
  const [totalHomes, setTotalHomes] = useState(0);
  const [totalBeds, setTotalBeds] = useState(0);
  
  useEffect(() => {
    if (properties && properties.length > 0) {
      const activeProperties = properties.filter(p => p.active);
      setTotalHomes(activeProperties.length);
      
      const bedsCount = activeProperties.reduce((sum, property) => {
        return sum + (property.capacity || 0);
      }, 0);
      setTotalBeds(Math.max(bedsCount, 1)); // Ensure at least 1 bed
    } else {
      setTotalHomes(0);
      setTotalBeds(1); // Default to 1 bed if no properties
    }
  }, [properties]);
  
  const monthlyTotal = (pricePerBed * totalBeds).toFixed(2);
  
  return (
    <Card className="border-2 border-care-100 shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="text-lg font-medium">
            <div>Total No of Home: {totalHomes}</div>
          </div>
          
          <div className="text-lg">
            <div>Total No. of Beds: {totalBeds}</div>
          </div>
          
          <div className="text-lg">
            <div>Monthly per Bed: ${pricePerBed.toFixed(2)}</div>
          </div>
          
          <div className="text-lg font-bold">
            <div>Total per Month: ${monthlyTotal}</div>
          </div>
          
          <div className="pt-3">
            <Button 
              onClick={onSubscribeClick}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Subscribe Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
