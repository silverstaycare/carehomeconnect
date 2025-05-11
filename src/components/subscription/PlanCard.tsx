
import { Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubscriptionPlan } from "@/types/subscription";

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  totalPrice: number;
  numberOfBeds: number;
  boostEnabled: boolean;
  boostPrice: number;
  onSubscribe: () => void;
}

export const PlanCard = ({
  plan,
  isCurrentPlan,
  totalPrice,
  numberOfBeds,
  boostEnabled,
  boostPrice,
  onSubscribe
}: PlanCardProps) => {
  return (
    <Card className={`${plan.recommended ? 'border-2 border-care-500 relative' : ''} flex flex-col h-full`}>
      {plan.recommended && (
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
          <Badge className="bg-care-500">Recommended</Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>
          {plan.name === 'Starter' ? 'For small care homes just starting out' :
           plan.name === 'Pro' ? 'For established care homes looking to grow' :
           'For multiple locations and advanced needs'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-6">
          <p className="text-3xl font-bold">
            ${totalPrice}
            <span className="text-lg font-normal text-gray-600">/mo</span>
          </p>
          <p className="text-sm text-gray-600">
            ${plan.pricePerBed}/bed/mo × {numberOfBeds} beds
            {boostEnabled && (
              <> + ${boostPrice} boost</>
            )}
          </p>
        </div>
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button 
          className={`w-full ${plan.recommended ? 'bg-care-600 hover:bg-care-700' : ''}`}
          variant={plan.recommended ? 'default' : 'outline'}
          disabled={isCurrentPlan}
          onClick={onSubscribe}
        >
          {isCurrentPlan
            ? 'Current Plan'
            : plan.recommended
              ? 'Upgrade Now'
              : 'Subscribe'}
        </Button>
      </CardFooter>
    </Card>
  );
};
