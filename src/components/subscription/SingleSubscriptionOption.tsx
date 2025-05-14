
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { Subscription } from "@/types/subscription";

interface SingleSubscriptionOptionProps {
  pricePerBed: number;
  numberOfBeds: number;
  totalPrice: number;
  currentSubscription: Subscription | null;
  isProcessing: boolean;
  onSubscribe: () => void;
  onManage: () => void;
}

export const SingleSubscriptionOption = ({
  pricePerBed,
  numberOfBeds,
  totalPrice,
  currentSubscription,
  isProcessing,
  onSubscribe,
  onManage
}: SingleSubscriptionOptionProps) => {
  const isSubscribed = currentSubscription?.status === 'active';
  
  const features = [
    'List your care home',
    'Profile with photos, description, and pricing',
    'Online booking inquiry form',
    'Email notifications for inquiries',
    'Analytics dashboard (views, inquiries)',
    'Priority placement in search results'
  ];

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      <Card className={`border-2 ${isSubscribed ? 'border-care-500' : ''} flex flex-col h-full`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Care Home Listing
              {isSubscribed && 
                <span className="ml-2 text-sm text-care-600 bg-care-50 px-2 py-1 rounded-md">Active</span>
              }
            </CardTitle>
          </div>
          <CardDescription>
            Professional care home listing service
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="mb-6">
            <p className="text-3xl font-bold">
              ${pricePerBed.toFixed(2)}
              <span className="text-lg font-normal text-gray-600">/bed/month</span>
            </p>
            <p className="text-sm text-gray-500">Total: ${totalPrice} for {numberOfBeds} beds</p>
          </div>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {isSubscribed && currentSubscription?.currentPeriodEnd && (
            <div className="mt-4 p-3 bg-slate-50 rounded-md">
              <p className="text-sm font-medium">
                Next billing date: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-auto">
          {isSubscribed ? (
            <Button 
              className="w-full"
              variant="outline"
              onClick={onManage}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : 'Manage Subscription'}
            </Button>
          ) : (
            <Button 
              className="w-full bg-care-600 hover:bg-care-700"
              onClick={onSubscribe}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : 'Subscribe Now'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
