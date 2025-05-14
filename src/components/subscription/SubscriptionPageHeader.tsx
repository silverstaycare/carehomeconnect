
import { Info } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { BedsInput } from './BedsInput';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Subscription } from '@/types/subscription';

interface SubscriptionPageHeaderProps {
  checkingSubscription?: boolean;
  currentSubscription: Subscription | null;
  numberOfBeds: number;
  onBedsChange: (beds: number) => void;
  pricePerBed: number;
}

export const SubscriptionPageHeader = ({
  checkingSubscription,
  currentSubscription,
  numberOfBeds,
  onBedsChange,
  pricePerBed
}: SubscriptionPageHeaderProps) => {
  const isSubscribed = currentSubscription?.status === 'active';

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Care Home Subscription</h1>
          <p className="text-gray-600">
            Subscribe to list your care home and receive inquiries from potential residents.
            {checkingSubscription && (
              <span className="ml-2 inline-flex items-center">
                <Spinner size="sm" className="mr-1" />
                Checking subscription...
              </span>
            )}
          </p>
        </div>
      </div>

      <Card className="border-care-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-2">How Billing Works</h3>
              <p className="text-gray-600 mb-2">
                Our subscription is priced at ${pricePerBed.toFixed(2)} per bed per month. 
                This means your monthly cost depends on the number of beds in your care home.
              </p>
              <div className="flex items-center text-gray-600 text-sm">
                <Info className="mr-1 h-4 w-4" />
                <p>You can manage or cancel your subscription at any time.</p>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-lg mb-2">Number of Beds</h3>
              <BedsInput 
                numberOfBeds={numberOfBeds}
                onBedsChange={onBedsChange}
              />
              <div className="mt-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center text-gray-600 text-sm underline cursor-help">
                      <Info className="mr-1 h-4 w-4" />
                      How is this calculated?
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Total cost = ${pricePerBed.toFixed(2)} × Number of beds</p>
                      <p>Current total: ${(pricePerBed * numberOfBeds).toFixed(2)}/month</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
