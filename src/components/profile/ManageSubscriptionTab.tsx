
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { useSubscriptionData } from "@/hooks/useSubscriptionData";
import { useProfileData } from "@/hooks/useProfileData";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { NoActiveSubscription } from "./subscription/NoActiveSubscription";
import { SubscriptionDetails } from "./subscription/SubscriptionDetails";
import { DirectSubscriptionForm } from "./subscription/DirectSubscriptionForm";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface ManageSubscriptionTabProps {
  user: any;
}

export function ManageSubscriptionTab({ user }: ManageSubscriptionTabProps) {
  const navigate = useNavigate();
  const { 
    subscription, 
    isLoading, 
    isProcessing, 
    fetchSubscription, 
    createPortalSession 
  } = useSubscriptionData(user?.id);
  const { profile } = useProfileData(user?.id);
  const { properties } = useOwnerProperties();
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);
  const [totalBeds, setTotalBeds] = useState(0);

  // Calculate total beds from properties
  useEffect(() => {
    if (properties && properties.length > 0) {
      const activeProperties = properties.filter(p => p.active);
      const bedsSum = activeProperties.reduce((sum, property) => sum + (property.capacity || 0), 0);
      setTotalBeds(Math.max(bedsSum, 1)); // Ensure minimum of 1 bed
    } else {
      setTotalBeds(1); // Default to 1 bed if no properties
    }
  }, [properties]);

  // Handle retry to reload subscription data
  const handleRetry = () => {
    fetchSubscription();
  };

  // Handle managing the subscription through Stripe portal
  const handleManageSubscription = async () => {
    const portalUrl = await createPortalSession();
    if (portalUrl) {
      window.location.href = portalUrl;
    } else {
      // Fallback to subscription page
      setTimeout(() => navigate("/owner/subscription"), 1500);
    }
  };

  // Show a loading state while initializing
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-center justify-center p-8">
          <Spinner size="lg" />
          <p className="ml-3 text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  // Determine whether the user is subscribed
  const isSubscribed = subscription?.status === "active";

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      {!isSubscribed ? (
        <div className="space-y-6">
          {showSubscribeForm ? (
            <DirectSubscriptionForm 
              user={user} 
              numberOfBeds={totalBeds}
              onCancel={() => setShowSubscribeForm(false)}
              onSubscriptionComplete={() => {
                setShowSubscribeForm(false);
                fetchSubscription();
              }}
            />
          ) : (
            <>
              <NoActiveSubscription 
                onRetry={handleRetry} 
                isProcessing={isProcessing}
              />
              
              <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="flex items-start mb-4">
                  <div className="bg-care-50 rounded-full p-2 mr-3">
                    <Check className="h-5 w-5 text-care-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Subscribe now directly</h3>
                    <p className="text-gray-600">
                      You have {totalBeds} beds across your properties. 
                      Subscribe now to list your properties and receive inquiries.
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowSubscribeForm(true)}
                  className="w-full md:w-auto"
                >
                  Subscribe Now
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <SubscriptionDetails
            subscription={subscription}
            profile={profile}
            isProcessing={isProcessing}
            onManageSubscription={handleManageSubscription}
          />
        </div>
      )}
    </div>
  );
}
