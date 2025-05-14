
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Calendar, Package } from 'lucide-react';
import type { Subscription } from '@/types/subscription';

interface CurrentSubscriptionProps {
  subscription: Subscription;
  isLoading: boolean;
  onManage: () => void;
  onCancel: () => void;
}

export const CurrentSubscription = ({
  subscription,
  isLoading,
  onManage,
  onCancel
}: CurrentSubscriptionProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const features = [
    'List your care home',
    'Profile with photos and descriptions',
    'Receive inquiries from potential residents',
    'Analytics dashboard with property views',
    'Priority placement in search results',
    'Direct messaging with potential residents',
  ];

  const renewalDate = subscription?.currentPeriodEnd 
    ? formatDate(subscription.currentPeriodEnd) 
    : 'Unknown';

  return (
    <Card className="border-2 border-care-500 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Current Subscription</span>
          <Badge className="bg-care-600">Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <h3 className="font-medium">Subscription Details</h3>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2 items-center text-gray-700">
              <Calendar className="h-5 w-5 text-care-600" />
              <div>
                <p className="font-medium">Next billing date</p>
                <p className="text-sm">{renewalDate}</p>
              </div>
            </div>

            <div className="flex gap-2 items-center text-gray-700">
              <Package className="h-5 w-5 text-care-600" />
              <div>
                <p className="font-medium">Number of beds</p>
                <p className="text-sm">{subscription.numberOfBeds}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Included Features</h3>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3 border-t pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel Subscription
        </Button>
        <Button onClick={onManage} disabled={isLoading}>
          Manage Subscription
        </Button>
      </CardFooter>
    </Card>
  );
};
