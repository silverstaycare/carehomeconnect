
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowUp, Home, Building, AlertCircle } from "lucide-react";
import { InputWithLabel } from "@/components/ui/InputWithLabel";

interface ManageSubscriptionTabProps {
  user: any;
}

interface PropertyData {
  id: string;
  capacity: number;
}

export function ManageSubscriptionTab({ user }: ManageSubscriptionTabProps) {
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const [numberOfProperties, setNumberOfProperties] = useState(0);
  const [numberOfBedsPerProperty, setNumberOfBedsPerProperty] = useState(0);
  const [totalBeds, setTotalBeds] = useState(0);
  const [propertiesData, setPropertiesData] = useState<PropertyData[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch the owner's properties and calculate total beds
  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;

      setIsLoadingProperties(true);
      setFetchError(null);
      
      try {
        const { data, error } = await supabase
          .from('care_homes')
          .select('id, capacity')
          .eq('owner_id', user.id)
          .eq('active', true);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setPropertiesData(data);
          const count = data.length;
          const totalCapacity = data.reduce((sum, home) => sum + (home.capacity || 0), 0);
          const avgBedsPerProp = Math.round(totalCapacity / count);
          
          setNumberOfProperties(count);
          setNumberOfBedsPerProperty(avgBedsPerProp || 1);
          setTotalBeds(totalCapacity);
        } else {
          // Default values if no properties
          setNumberOfProperties(1);
          setNumberOfBedsPerProperty(1);
          setTotalBeds(1);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        setFetchError("Failed to load property data. Using default values instead.");
        
        // Set defaults on error
        setNumberOfProperties(1);
        setNumberOfBedsPerProperty(1);
        setTotalBeds(1);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchProperties();
  }, [user, toast]);

  // Check subscription status
  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      setIsCheckingSubscription(true);
      setFetchError(null);
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data);
      
      // Set initial values based on current subscription
      if (data.subscription) {
        setNumberOfProperties(data.subscription.numberOfProperties || numberOfProperties);
        setNumberOfBedsPerProperty(data.subscription.numberOfBedsPerProperty || numberOfBedsPerProperty);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setFetchError("Failed to check subscription status. Some features may be limited.");
      
      // Create a minimal subscription object with default values
      setSubscription({
        subscribed: false,
        subscription: {
          planId: 'basic',
          hasBoost: false
        }
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
    const calculatedTotalBeds = numberOfProperties * numberOfBedsPerProperty;
    const boostPrice = subscription.subscription.hasBoost ? 49.99 : 0;
    
    const total = (pricePerBed * calculatedTotalBeds) + boostPrice;
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

  const handleManageSubscription = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to manage your subscription",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    try {
      setIsManagingSubscription(true);
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      console.error("Error creating customer portal session:", error);
      toast({
        title: "Portal Access Failed",
        description: "Unable to access subscription management portal. Redirecting to subscription page instead.",
        variant: "destructive",
      });
      // Fallback to subscription page
      setTimeout(() => navigate("/owner/subscription"), 1500);
    } finally {
      setIsManagingSubscription(false);
    }
  };

  // Show a loading state or error state while initializing
  if (isCheckingSubscription || isLoadingProperties) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Manage Subscription</h2>
        <div className="flex items-center justify-center p-8">
          <Spinner size="lg" />
          <p className="ml-3 text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  // Regular content view
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Manage Subscription</h2>
      
      {fetchError && (
        <div className="mb-4 p-3 border border-amber-200 bg-amber-50 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">{fetchError}</p>
          </div>
        </div>
      )}
      
      {subscription?.subscribed ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan: {subscription.subscription?.planId === 'basic' ? 'Starter' : 'Pro'}</CardTitle>
              <CardDescription>
                Based on your actual property data - {propertiesData.length} properties with a total of {totalBeds} beds
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
                    onChange={(e) => {
                      const count = Math.max(1, parseInt(e.target.value) || 1);
                      setNumberOfProperties(count);
                    }}
                    icon={<Building className="h-4 w-4 text-gray-500" />}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You currently have {propertiesData.length} active properties
                  </p>
                </div>
                
                <div>
                  <InputWithLabel
                    id="beds"
                    label="Beds per Property"
                    type="number"
                    min={1}
                    value={numberOfBedsPerProperty}
                    onChange={(e) => {
                      const count = Math.max(1, parseInt(e.target.value) || 1);
                      setNumberOfBedsPerProperty(count);
                    }}
                    icon={<Home className="h-4 w-4 text-gray-500" />}
                  />
                  {propertiesData.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Your properties average {Math.round(totalBeds / propertiesData.length)} beds per property
                    </p>
                  )}
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

                {numberOfProperties !== propertiesData.length && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-800">
                        Your subscription settings don't match your actual property count. 
                        This may affect billing.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={isManagingSubscription}
                >
                  {isManagingSubscription ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Opening Portal...
                    </>
                  ) : (
                    "Manage Current Plan"
                  )}
                </Button>
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
