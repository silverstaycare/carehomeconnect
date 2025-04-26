
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import type { Subscription, SubscriptionPlan } from "@/types/subscription";
import { BoostAddOn } from "@/components/subscription/BoostAddOn";
import { BedsInput } from "@/components/subscription/BedsInput";
import { CurrentSubscription } from "@/components/subscription/CurrentSubscription";
import { PlanCard } from "@/components/subscription/PlanCard";

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
          'List your care home',
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Silver Stay Subscription Plans</h1>
        <p className="text-gray-600 mb-6">
          Choose the subscription plan that works best for your residential care home business needs.
        </p>
        
        <BoostAddOn 
          boostEnabled={boostEnabled}
          onBoostChange={setBoostEnabled}
          price={boostPrice}
        />

        <BedsInput
          numberOfBeds={numberOfBeds}
          onBedsChange={setNumberOfBeds}
        />
      </div>

      {currentSubscription?.status === 'active' && (
        <CurrentSubscription
          subscription={currentSubscription}
          plans={plans}
          onCancel={handleCancel}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentSubscription?.planId === plan.id && currentSubscription?.status === 'active'}
            totalPrice={Number(calculateTotalPrice(plan.pricePerBed))}
            numberOfBeds={numberOfBeds}
            boostEnabled={boostEnabled}
            boostPrice={boostPrice}
            onSubscribe={() => handleSubscribe(plan.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;
