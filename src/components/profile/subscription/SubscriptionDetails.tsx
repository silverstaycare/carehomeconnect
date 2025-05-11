
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Check } from 'lucide-react';
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
  
  // Define features based on the plan
  const features = isPro ? [
    'Grow faster, more leads',
    'Priority placement in search results',
    'SMS/Email lead notifications',
    'Online booking inquiry form',
    'Up to 5 homes/properties',
    'Analytics dashboard'
  ] : [
    'Get online',
    'List your care home',
    'Basic profile (photos, description, pricing)',
    'Inquiries sent to email',
    'Limited to 1 active listing per home'
  ];
  
  return (
    <Card className={`border-2 ${isPro ? 'border-care-500' : 'border-blue-400'}`}>
      <CardHeader>
        <CardTitle>Current Plan: {isPro ? 'Pro' : 'Starter'}</CardTitle>
        <CardDescription>
          Subscription details and management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="mb-6">
            <p className="text-2xl font-bold">
              ${isPro ? '79.99' : '59.99'}
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
              
              {subscription?.hasBoost && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Visibility boost:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Active
                  </Badge>
                </div>
              )}
            </div>
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
