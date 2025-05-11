import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowUp, Home, Building, AlertCircle, RefreshCw } from "lucide-react";
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
  const [loadAttempt, setLoadAttempt] = useState(0); // To track retry attempts
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch the owner's properties and calculate total beds
  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;

      setIsLoadingProperties(true);
      setFetchError(null);
      
      try {
        console.log("Fetching properties for user:", user.id);
        const { data, error } = await supabase
          .from('care_homes')
          .select('id, capacity')
          .eq('owner_id', user.id)
          .eq('active', true);
        
        if (error) {
          console.error("Supabase error fetching properties:", error);
          throw error;
        }
        
        console.log("Properties data received:", data);
        
        if (data && data.length > 0) {
          setPropertiesData(data);
          const count = data.length;
          const totalCapacity = data.reduce((sum, home) => sum + (home.capacity || 0), 0);
          const avgBedsPerProp = Math.round(totalCapacity / count);
          
          setNumberOfProperties(count);
          setNumberOfBedsPerProperty(avgBedsPerProp || 1);
          setTotalBeds(totalCapacity);
        } else {
          console.log("No properties found, setting defaults");
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
  }, [user, loadAttempt]); // Also refetch when loadAttempt changes

  // Check subscription status
  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      setIsCheckingSubscription(true);
      setFetchError(null);
      
      console.log("Checking subscription status for user:", user.id);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }
      
      console.log("Subscription data received:", data);
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
    console.log("Loading subscription data, user:", user?.id);
    checkSubscriptionStatus();
  }, [user, loadAttempt]); // Also refetch when loadAttempt changes

  // Calculate total monthly payment based on subscription and property data
  const calculateTotalMonthly = () => {
    if (!subscription?.subscription) return "0.00";
    
    const pricePerBed = subscription.subscription.planId === 'basic' ? 59.99 : 79.99;
    const calculatedTotalBeds = totalBeds;
    const boostPrice = subscription.subscription.hasBoost ? 49.99 : 0;
    
    const total = (pricePerBed * calculatedTotalBeds) + boostPrice;
    return total.toFixed(2);
  };

  // Handle updating the subscription
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
  
  // Handle navigating to subscription page
  const handleNavigateToSubscriptions = () => {
    navigate("/owner/subscription");
  };

  // Handle managing the subscription
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
      
      if (data?.url) {
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

  // Handle retrying to reload subscription data
  const handleRetry = () => {
    setLoadAttempt(prev => prev + 1);
    setFetchError(null);
    toast({
      title: "Retrying",
      description: "Attempting to reload subscription data...",
    });
  };

  // Show a loading state while initializing
  if (isCheckingSubscription || isLoadingProperties) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Subscription Management</h2>
        <div className="flex items-center justify-center p-8">
          <Spinner size="lg" />
          <p className="ml-3 text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  // Show error state if there are critical errors
  if (!subscription && fetchError) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Subscription Management</h2>
        <div className="p-6 border border-red-200 bg-red-50 rounded-md mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Subscription</h3>
              <p className="text-red-700 mb-4">{fetchError}</p>
              <Button onClick={handleRetry} variant="outline" size="sm" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" /> Retry Loading
              </Button>
            </div>
          </div>
        </div>
        <div className="text-center mt-6">
          <Button onClick={handleNavigateToSubscriptions}>
            View Subscription Plans
          </Button>
        </div>
      </div>
    );
  }

  // Regular content view
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Subscription Management</h2>
      
      {fetchError && (
        <div className="mb-4 p-3 border border-amber-200 bg-amber-50 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800">{fetchError}</p>
              <Button 
                onClick={handleRetry} 
                variant="link" 
                size="sm" 
                className="text-amber-800 p-0 h-auto mt-1"
              >
                Retry loading data
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {subscription?.subscribed ? (
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
                onClick={() => navigate("/owner/subscription", { state: { upgradeIntent: true } })}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </div>
          )}
          
          <Card className={`border-2 ${subscription.subscription?.planId === 'pro' ? 'border-care-500' : 'border-blue-400'}`}>
            <CardHeader>
              <CardTitle>Current Plan: {subscription.subscription?.planId === 'basic' ? 'Starter' : 'Pro'}</CardTitle>
              <CardDescription>
                {/* Property and bed information removed as requested */}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Current Properties</p>
                  <div className="flex items-center bg-gray-50 p-3 rounded-md">
                    <Building className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="font-medium">{propertiesData.length}</span>
                    <span className="text-gray-500 ml-1">active properties</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Beds</p>
                  <div className="flex items-center bg-gray-50 p-3 rounded-md">
                    <Home className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="font-medium">{totalBeds}</span>
                    <span className="text-gray-500 ml-1">total beds</span>
                  </div>
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
                    <span className="font-medium">{propertiesData.length}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Total beds:</span>
                    <span className="font-medium">{totalBeds}</span>
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
              
              <div className="mt-6 flex justify-end gap-3">
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
                    "Manage Subscription"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
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
              onClick={handleRetry}
              size="sm"
              className="flex items-center gap-2"
            >
              Retry loading data
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
