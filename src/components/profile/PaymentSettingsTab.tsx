
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PaymentSettingsTabProps {
  user: any;
}

export function PaymentSettingsTab({ user }: PaymentSettingsTabProps) {
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check subscription status
  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      setIsCheckingSubscription(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  // Load subscription status when component mounts
  useState(() => {
    checkSubscriptionStatus();
  });

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error accessing customer portal:", error);
      toast({
        title: "Error",
        description: "Failed to access subscription management portal",
        variant: "destructive",
      });
    }
  };

  const handleNavigateToSubscriptions = () => {
    navigate("/owner/subscription");
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Subscription Management</h2>
      
      {isCheckingSubscription ? (
        <div className="flex items-center justify-center p-8">
          <Spinner size="lg" />
          <p className="ml-3 text-gray-600">Checking subscription status...</p>
        </div>
      ) : subscription?.subscribed ? (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="font-medium text-green-800">Active Subscription</h3>
            <p className="text-green-700">
              You have an active {subscription.subscription_tier || "Silver Stay"} subscription.
              {subscription.subscription_end && (
                <span> Next billing date: {new Date(subscription.subscription_end).toLocaleDateString()}</span>
              )}
            </p>
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={checkSubscriptionStatus}
              size="sm"
            >
              Refresh Status
            </Button>
            
            <Button onClick={handleManageSubscription}>
              Manage Subscription
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border border-amber-200 bg-amber-50 rounded-md p-4">
            <h3 className="font-medium text-amber-800">No Active Subscription</h3>
            <p className="text-amber-700">
              You don't have an active subscription. Subscribe to list your properties.
            </p>
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={checkSubscriptionStatus}
              size="sm"
            >
              Refresh Status
            </Button>
            
            <Button onClick={handleNavigateToSubscriptions}>
              View Subscription Plans
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
