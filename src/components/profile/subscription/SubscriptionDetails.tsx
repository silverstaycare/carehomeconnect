
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Subscription } from "@/types/subscription";
import { ProfileData } from "@/hooks/useProfileData";

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
  const isPro = subscription?.planId === 'pro';
  
  return (
    <Card className={`border-2 ${isPro ? 'border-care-500' : 'border-blue-400'}`}>
      <CardHeader>
        <CardTitle>Current Plan: {isPro ? 'Pro' : 'Starter'}</CardTitle>
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
                  ${isPro ? '79.99' : '59.99'}/bed/month
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
