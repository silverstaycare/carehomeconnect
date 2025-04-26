import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Rocket } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SubscriptionPlan {
  id: string;
  name: string;
  pricePerBed: number;
  billingCycle: string;
  features: string[];
  recommended?: boolean;
}

interface Subscription {
  planId: string;
  status: 'active' | 'canceled' | 'expired' | null;
  currentPeriodEnd: string | null;
  hasBoost?: boolean;
}

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [boostEnabled, setBoostEnabled] = useState(false);
  const [numberOfBeds, setNumberOfBeds] = useState(1);
  const boostPrice = 49.99;

  useEffect(() => {
    const mockPlans: SubscriptionPlan[] = [
      {
        id: 'basic',
        name: 'Starter',
        pricePerBed: 9.99,
        billingCycle: 'monthly',
        features: [
          'Get online.',
          'List your property',
          'Basic profile (photos, description, pricing)',
          'Inquiries sent to email',
          'Limited to 1 active listing per home'
        ]
      },
      {
        id: 'pro',
        name: 'Pro',
        pricePerBed: 14.99,
        billingCycle: 'monthly',
        features: [
          'Grow faster, more leads.',
          'Everything in Starter',
          'Priority placement in search results',
          'SMS/Email lead notifications',
          'Online booking inquiry form',
          'Up to 5 homes/properties',
          'Analytics dashboard (views, inquiries)'
        ],
        recommended: true
      },
      {
        id: 'elite',
        name: 'Elite',
        pricePerBed: 19.99,
        billingCycle: 'monthly',
        features: [
          'Professionalize + dominate your market.',
          'Everything in Pro',
          'Verified Home Badge (trust badge)',
          'CRM-lite: Track leads and resident pipeline',
          'Automated reviews collection',
          'Ability to offer promotions (first month free, etc.)',
          'Multi-user accounts (for staff)'
        ]
      }
    ];

    const mockSubscription: Subscription = {
      planId: 'basic',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      hasBoost: false
    };

    setPlans(mockPlans);
    setCurrentSubscription(mockSubscription);
    setIsLoading(false);
  }, []);

  const calculateTotalPrice = (pricePerBed: number) => {
    let total = pricePerBed * numberOfBeds;
    if (boostEnabled) {
      total += boostPrice;
    }
    return total.toFixed(2);
  };

  const handleSubscribe = (planId: string) => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) return;

    const total = calculateTotalPrice(selectedPlan.pricePerBed);
    
    toast({
      title: 'Subscription Updated',
      description: `You have successfully subscribed to the ${selectedPlan.name} plan with ${numberOfBeds} bed${numberOfBeds > 1 ? 's' : ''} ${boostEnabled ? 'and Boost add-on' : ''} for $${total}/month.`,
    });
    
    setCurrentSubscription({
      planId,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      hasBoost: boostEnabled
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
        <p className="text-gray-600 mb-6">
          Choose the subscription plan that works best for your care home business needs.
        </p>
        
        <Card className="p-4 mb-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Rocket className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Boost Your Listing</h3>
                <p className="text-sm text-gray-600">Push your property to the top of search results</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={boostEnabled}
                onCheckedChange={setBoostEnabled}
                id="boost-mode"
              />
              <Label htmlFor="boost-mode" className="font-medium text-purple-700">
                +$49.99/mo
              </Label>
            </div>
          </div>
        </Card>

        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="beds" className="font-medium">Number of Beds:</Label>
            <input
              type="number"
              id="beds"
              min="1"
              value={numberOfBeds}
              onChange={(e) => setNumberOfBeds(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 px-3 py-2 border rounded-md"
            />
          </div>
        </Card>
      </div>

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
                  {currentSubscription.hasBoost && (
                    <Badge variant="secondary" className="mt-2">
                      Boost Enabled
                    </Badge>
                  )}
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
            className={`${plan.recommended ? 'border-2 border-care-500 relative' : ''}`}
          >
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
            <CardContent>
              <div className="mb-6">
                <p className="text-3xl font-bold">
                  ${calculateTotalPrice(plan.pricePerBed)}
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
    </div>
  );
};

export default SubscriptionPage;
