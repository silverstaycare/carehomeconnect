
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowUp, Home, Building } from "lucide-react";
import { InputWithLabel } from "@/components/ui/InputWithLabel";

interface ManageSubscriptionTabProps {
  user: any;
}

export function ManageSubscriptionTab({ user }: ManageSubscriptionTabProps) {
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [numberOfProperties, setNumberOfProperties] = useState(1);
  const [numberOfBedsPerProperty, setNumberOfBedsPerProperty] = useState(1);
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
      
      // Set initial values based on current subscription
      if (data.subscription) {
        setNumberOfProperties(data.subscription.numberOfProperties || 1);
        setNumberOfBedsPerProperty(data.subscription.numberOfBedsPerProperty || 1);
      }
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

  const calculateTotalMonthly = () => {
    if (!subscription?.subscription) return "0.00";
    
    const pricePerBed = subscription.subscription.planId === 'basic' ? 59.99 : 79.99;
    const totalBeds = numberOfProperties * numberOfBedsPerProperty;
    const boostPrice = subscription.subscription.hasBoost ? 49.99 : 0;
    
    const total = (pricePerBed * totalBeds) + boostPrice;
    return total.toFixed(2);
  };

  const handleUpdateSubscription = async () => {
    try {
      setIsUpdating(true);
      
      // Navigate to subscription page with current selections
      navigate("/owner/subscription", { 
        state: { 
          numberOfProperties, 
          numberOfBedsPerProperty,
          updateIntent: true
        } 
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleNavigateToSubscriptions = () => {
    navigate("/owner/subscription");
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Manage Subscription</h2>
      
      {isCheckingSubscription ? (
        <div className="flex items-center justify-center p-8">
          <Spinner size="lg" />
          <p className="ml-3 text-gray-600">Checking subscription status...</p>
        </div>
      ) : subscription?.subscribed ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan: {subscription.subscription?.planId === 'basic' ? 'Starter' : 'Pro'}</CardTitle>
              <CardDescription>
                Adjust your subscription parameters below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <InputWithLabel
                    id="properties"
                    label="Number of Properties"
                    type="number"
                    min={1}
                    value={numberOfProperties}
                    onChange={(e) => setNumberOfProperties(Math.max(1, parseInt(e.target.value) || 1))}
                    icon={<Building className="h-4 w-4 text-gray-500" />}
                  />
                </div>
                
                <div>
                  <InputWithLabel
                    id="beds"
                    label="Beds per Property"
                    type="number"
                    min={1}
                    value={numberOfBedsPerProperty}
                    onChange={(e) => setNumberOfBedsPerProperty(Math.max(1, parseInt(e.target.value) || 1))}
                    icon={<Home className="h-4 w-4 text-gray-500" />}
                  />
                </div>
                
                <div className="mt-6 bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Plan rate:</span>
                    <span className="font-medium">
                      ${subscription.subscription?.planId === 'basic' ? '59.99' : '79.99'}/bed/month
                    </span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Properties:</span>
                    <span className="font-medium">{numberOfProperties}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Beds per property:</span>
                    <span className="font-medium">{numberOfBedsPerProperty}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Total beds:</span>
                    <span className="font-medium">{numberOfProperties * numberOfBedsPerProperty}</span>
                  </div>
                  
                  {subscription.subscription?.hasBoost && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Visibility boost:</span>
                      <span className="font-medium text-green-600">$49.99</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Total monthly payment:</span>
                    <span className="font-bold text-care-600">
                      ${calculateTotalMonthly()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleUpdateSubscription}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Please wait...
                    </>
                  ) : (
                    "Update Subscription"
                  )}
                </Button>
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
