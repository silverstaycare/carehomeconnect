
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Check } from 'lucide-react';
import { Subscription } from "@/types/subscription";
import { ProfileData } from "@/hooks/useProfileData";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { useEffect, useState } from "react";

interface SubscriptionDetailsProps {
  subscription: Subscription;
  profile: ProfileData | null;
  isProcessing: boolean;
  onManageSubscription: () => void;
}

export function SubscriptionDetails({
  subscription,
  profile,
  isProcessing,
  onManageSubscription
}: SubscriptionDetailsProps) {
  const { properties } = useOwnerProperties();
  const [totalBeds, setTotalBeds] = useState(0);
  
  // Calculate total beds across all active properties
  useEffect(() => {
    if (properties && properties.length > 0) {
      const activeProperties = properties.filter(p => p.active);
      const bedsSum = activeProperties.reduce((sum, property) => sum + (property.capacity || 0), 0);
      setTotalBeds(bedsSum);
    }
  }, [properties]);
  
  // Define features based on the plan
  const features = [
    'List your care home',
    'Profile with photos, description, and pricing',
    'Online booking inquiry form',
    'Email notifications for inquiries',
    'Analytics dashboard (views, inquiries)',
    'Priority placement in search results'
  ];

  // Calculate monthly payment details
  const pricePerBed = 19.99;
  const numberOfProperties = properties ? properties.filter(p => p.active).length : 0;
  const numberOfBeds = subscription.numberOfBeds || totalBeds || 1;
  const monthlyTotal = (pricePerBed * numberOfBeds).toFixed(2);
  
  return (
    <Card className="border-2 border-care-500">
      <CardHeader>
        <CardTitle>Current Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="mb-6">
            <p className="text-2xl font-bold">
              ${pricePerBed}
              <span className="text-lg font-normal text-gray-600">/bed/month</span>
            </p>
          </div>
          
          <ul className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          {profile?.role === "owner" && (
            <div className="space-y-4">
              {subscription?.currentPeriodEnd && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Next billing date:</span>
                  <span className="font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Current Monthly Billing Summary */}
        <div className="mt-6 mb-6 bg-care-50 p-4 rounded-lg border border-care-200">
          <h3 className="font-medium text-care-800 mb-3">Current Monthly Billing</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Listed Properties:</span>
              <span className="font-medium">{numberOfProperties}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Beds:</span>
              <span className="font-medium">{numberOfBeds}</span>
            </div>
            <div className="flex justify-between">
              <span>Rate Per Bed:</span>
              <span className="font-medium">${pricePerBed}</span>
            </div>
            <div className="border-t border-care-200 pt-2 mt-2 flex justify-between font-bold">
              <span>Total Monthly Cost:</span>
              <span>${monthlyTotal}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button 
            onClick={onManageSubscription}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Please wait...
              </>
            ) : (
              "Manage Subscription"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
