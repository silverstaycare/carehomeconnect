
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowUp, Home, Building, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscriptionData } from "@/hooks/useSubscriptionData";
import { useProfileData } from "@/hooks/useProfileData";

interface ManageSubscriptionTabProps {
  user: any;
}

export function ManageSubscriptionTab({ user }: ManageSubscriptionTabProps) {
  const navigate = useNavigate();
  const { subscription, isLoading, isProcessing, fetchSubscription, createPortalSession } = useSubscriptionData(user?.id);
  const { profile } = useProfileData(user?.id);

  // Handle retry to reload subscription data
  const handleRetry = () => {
    fetchSubscription();
  };

  // Handle navigating to subscription page
  const handleNavigateToSubscriptions = () => {
    navigate("/owner/subscription");
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
      ) : (
        <div className="space-y-6">
          {subscription?.planId === 'basic' && (
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
          
          <Card className={`border-2 ${subscription?.planId === 'pro' ? 'border-care-500' : 'border-blue-400'}`}>
            <CardHeader>
              <CardTitle>Current Plan: {subscription?.planId === 'basic' ? 'Starter' : 'Pro'}</CardTitle>
              <CardDescription>
                Subscription details and management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile?.role === "owner" && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Plan rate:</span>
                      <span className="font-medium">
                        ${subscription?.planId === 'basic' ? '59.99' : '79.99'}/bed/month
                      </span>
                    </div>
                    
                    {subscription?.currentPeriodEnd && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Next billing date:</span>
                        <span className="font-medium">
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {subscription?.hasBoost && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Visibility boost:</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Active
                        </Badge>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  onClick={handleManageSubscription}
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
        </div>
      )}
    </div>
  );
}
