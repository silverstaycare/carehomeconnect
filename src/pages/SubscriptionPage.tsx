
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Check } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  features: string[];
  recommended?: boolean;
}

interface Subscription {
  planId: string;
  status: 'active' | 'canceled' | 'expired' | null;
  currentPeriodEnd: string | null;
}

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for subscription plans
    const mockPlans: SubscriptionPlan[] = [
      {
        id: 'basic',
        name: 'Basic',
        price: 29,
        billingCycle: 'monthly',
        features: [
          'List 1 property',
          'Basic property details',
          'Email support',
          'Standard visibility'
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 79,
        billingCycle: 'monthly',
        features: [
          'List up to 3 properties',
          'Enhanced property details',
          'Priority email and phone support',
          'Featured placement in search results',
          'Property analytics'
        ],
        recommended: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 149,
        billingCycle: 'monthly',
        features: [
          'Unlimited properties',
          'Complete property details',
          'Dedicated account manager',
          'Top placement in search results',
          'Advanced analytics dashboard',
          'Resident management tools'
        ]
      }
    ];

    // Mock current subscription - in a real app this would be fetched from an API
    const mockSubscription: Subscription = {
      planId: 'basic',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    setPlans(mockPlans);
    setCurrentSubscription(mockSubscription);
    setIsLoading(false);
  }, []);

  const handleSubscribe = (planId: string) => {
    // In a real app, this would redirect to a payment page or open a Stripe checkout
    toast({
      title: 'Subscription Updated',
      description: `You have successfully subscribed to the ${plans.find(p => p.id === planId)?.name} plan.`,
    });
    setCurrentSubscription({
      planId,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    });
  };

  const handleCancel = () => {
    if (currentSubscription) {
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled. You will still have access until the end of your current billing period.',
      });
      setCurrentSubscription({
        ...currentSubscription,
        status: 'canceled'
      });
    }
  };

  return (
    <div className="container py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-gray-600">
          Choose the subscription plan that works best for your care home business needs.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          {currentSubscription?.status === 'active' && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Current Subscription</CardTitle>
                  <CardDescription>
                    Your subscription details and management options.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <Badge className="mb-2">
                        {currentSubscription.status === 'active' ? 'Active' : 'Canceled'}
                      </Badge>
                      <h3 className="text-xl font-bold">
                        {plans.find(p => p.id === currentSubscription.planId)?.name} Plan
                      </h3>
                      <p className="text-gray-600">
                        {currentSubscription.currentPeriodEnd ? (
                          <>
                            {currentSubscription.status === 'active' ? (
                              <>Next billing date: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}</>
                            ) : (
                              <>Access until: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}</>
                            )}
                          </>
                        ) : null}
                      </p>
                    </div>
                    {currentSubscription.status === 'active' && (
                      <Button 
                        variant="outline"
                        className="mt-4 md:mt-0"
                        onClick={handleCancel}
                      >
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`${plan.recommended ? 'border-2 border-care-500 relative' : ''} care-card`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
                    <Badge className="bg-care-500">Recommended</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.name === 'Basic' ? 'For small care homes just starting out' :
                     plan.name === 'Premium' ? 'For established care homes looking to grow' :
                     'For multiple locations and advanced needs'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-3xl font-bold">${plan.price}<span className="text-lg font-normal text-gray-600">/mo</span></p>
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
                <CardFooter>
                  <Button 
                    className={`w-full ${plan.recommended ? 'bg-care-600 hover:bg-care-700' : ''}`}
                    variant={plan.recommended ? 'default' : 'outline'}
                    disabled={currentSubscription?.planId === plan.id && currentSubscription?.status === 'active'}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {currentSubscription?.planId === plan.id && currentSubscription?.status === 'active'
                      ? 'Current Plan'
                      : plan.recommended
                        ? 'Upgrade Now'
                        : 'Subscribe'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SubscriptionPage;
