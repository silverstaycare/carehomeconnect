
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Subscription } from "@/types/subscription";

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
  useEffect(() => {
    checkSubscriptionStatus();
  }, [user]);

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

  const handleUpgradeSubscription = () => {
    navigate("/owner/subscription", { state: { upgradeIntent: true } });
  };

  const getFeaturesList = (plan: string): string[] => {
    if (plan === 'basic') {
      return [
        'List your care home',
        'Basic profile (photos, description, pricing)',
        'Inquiries sent to email',
        'Limited to 1 active listing per home'
      ];
    } else if (plan === 'pro') {
      return [
        'Everything in Starter',
        'Priority placement in search results',
        'SMS/Email lead notifications',
        'Online booking inquiry form',
        'Up to 5 homes/properties',
        'Analytics dashboard'
      ];
    }
    return []; // Default empty list
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
          {subscription.subscription?.planId === 'basic' && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6 flex justify-between items-center">
              <div>
                <h3 className="font-medium text-amber-800">Upgrade Available</h3>
                <p className="text-amber-700">
                  Unlock more features with our Pro plan
                </p>
              </div>
              <Button 
                onClick={handleUpgradeSubscription}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </div>
          )}
          
          <Card className={`border-2 ${subscription.subscription?.planId === 'pro' ? 'border-care-500' : 'border-blue-400'}`}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-xl">
                      {subscription.subscription?.planId === 'basic' ? 'Starter' : 'Pro'} Plan
                    </h3>
                    <Badge className={`${subscription.subscription?.planId === 'pro' ? 'bg-care-500' : 'bg-blue-400'}`}>
                      Active
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-4">
                    ${subscription.subscription?.planId === 'basic' ? '59.99' : '79.99'}/month per bed
                    {subscription.subscription?.numberOfBeds > 1 && ` × ${subscription.subscription?.numberOfBeds} beds`}
                    {subscription.subscription?.hasBoost && ' + $49.99 boost'}
                  </p>
                </div>
                {subscription.subscription?.planId === 'pro' && (
                  <Badge className="bg-green-600">Recommended</Badge>
                )}
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="font-medium text-gray-700">Features:</p>
                <ul className="space-y-1">
                  {getFeaturesList(subscription.subscription?.planId).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Next billing date:</span>
                  <span className="font-medium">
                    {subscription.subscription?.currentPeriodEnd && new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
                {subscription.subscription?.hasBoost && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visibility boost:</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                )}
                
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                  <span className="text-gray-600 font-medium">Total monthly payment:</span>
                  <span className="font-bold text-care-600">
                    ${calculateTotalMonthly(subscription.subscription)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center mt-6">
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
  
  function calculateTotalMonthly(subscriptionData: any): string {
    if (!subscriptionData) return "0.00";
    
    const pricePerBed = subscriptionData.planId === 'basic' ? 59.99 : 79.99;
    const numberOfBeds = subscriptionData.numberOfBeds || 1;
    const boostPrice = subscriptionData.hasBoost ? 49.99 : 0;
    
    const total = (pricePerBed * numberOfBeds) + boostPrice;
    return total.toFixed(2);
  }
}
