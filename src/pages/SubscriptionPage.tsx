
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

import type { Subscription, SubscriptionPlan } from "@/types/subscription";
import { BoostAddOn } from "@/components/subscription/BoostAddOn";
import { BedsInput } from "@/components/subscription/BedsInput";
import { PlanCard } from "@/components/subscription/PlanCard";
import { PromoCodeBox } from "@/components/subscription/PromoCodeBox";

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [boostEnabled, setBoostEnabled] = useState(false);
  const [numberOfBeds, setNumberOfBeds] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const boostPrice = 49.99;
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showCanceledDialog, setShowCanceledDialog] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  // Check for success or canceled status from URL
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessDialog(true);
      checkSubscriptionStatus();
    } else if (searchParams.get('canceled') === 'true') {
      setShowCanceledDialog(true);
    }
    // Clean up URL params
    if (searchParams.has('success') || searchParams.has('canceled')) {
      navigate('/owner/subscription', { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const mockPlans: SubscriptionPlan[] = [
      {
        id: 'basic',
        name: 'Starter',
        pricePerBed: 59.99,
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
        pricePerBed: 79.99,
        billingCycle: 'monthly',
        features: [
          'Grow faster, more leads.',
          'Everything in Starter',
          'Priority placement in search results',
          'SMS/Email lead notifications',
          'Online booking inquiry form',
          'Up to 5 homes/properties',
          'Analytics dashboard (views, inquiries)'
        ]
      }
    ];

    setPlans(mockPlans);
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setCheckingSubscription(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      if (data.subscribed && data.subscription) {
        setCurrentSubscription({
          planId: data.subscription.planId,
          status: data.subscription.status,
          currentPeriodEnd: data.subscription.currentPeriodEnd,
          hasBoost: data.subscription.hasBoost
        });
        
        // Set the UI to match the current subscription
        setBoostEnabled(data.subscription.hasBoost);
        setNumberOfBeds(data.subscription.numberOfBeds);
      } else {
        setCurrentSubscription(null);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCheckingSubscription(false);
    }
  };

  const calculateTotalPrice = (pricePerBed: number) => {
    let total = pricePerBed * numberOfBeds;
    if (boostEnabled) {
      total += boostPrice;
    }
    return total.toFixed(2);
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to subscribe to a plan",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) return;
    
    try {
      setIsProcessing(true);
      
      // Create a checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId,
          numberOfBeds,
          boostEnabled,
        },
      });
      
      if (error) throw error;
      
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to manage your subscription",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      console.error("Error creating customer portal session:", error);
      toast({
        title: "Error",
        description: "Failed to access subscription management portal",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePromoCode = (code: string) => {
    toast({
      title: "Promo Code Applied",
      description: `The promo code "${code}" has been applied to your subscription.`,
    });
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleConfirmPlanChange = async () => {
    if (!selectedPlanId) {
      toast({
        title: "No Plan Selected",
        description: "Please select a plan before confirming",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create a checkout session with the existing payment method
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: selectedPlanId,
          numberOfBeds,
          boostEnabled,
          useExistingPaymentMethod: true,
        },
      });
      
      if (error) throw error;
      
      // Handle the response - might immediately redirect or confirm the change
      if (data.success) {
        toast({
          title: "Plan Updated",
          description: "Your subscription plan has been updated successfully",
        });
        checkSubscriptionStatus();
      } else if (data.url) {
        // If we still need to redirect to a checkout page
        window.location.href = data.url;
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription plan",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Silver Stay Subscription Plans</h1>
        <p className="text-gray-600 mb-6">
          Choose the subscription plan that works best for your residential care home business needs.
        </p>
        
        {checkingSubscription ? (
          <div className="flex items-center space-x-2 mb-4">
            <Spinner size="sm" />
            <span className="text-gray-600">Checking subscription status...</span>
          </div>
        ) : null}
        
        {!currentSubscription?.status && (
          <div className="space-y-6">
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
        )}
      </div>

      <PromoCodeBox onApplyPromo={handlePromoCode} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentSubscription?.planId === plan.id && currentSubscription?.status === 'active'}
            totalPrice={Number(calculateTotalPrice(plan.pricePerBed))}
            numberOfBeds={numberOfBeds}
            boostEnabled={boostEnabled}
            boostPrice={boostPrice}
            isSelected={selectedPlanId === plan.id}
            onSelect={() => handleSelectPlan(plan.id)}
            onSubscribe={() => handleSubscribe(plan.id)}
          />
        ))}
      </div>

      {currentSubscription?.status === 'active' && selectedPlanId && (
        <div className="flex justify-center mt-6">
          <Button 
            onClick={handleConfirmPlanChange}
            size="lg"
            className="px-8"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              'Confirm Plan Change'
            )}
          </Button>
        </div>
      )}

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <Check className="mr-2 h-5 w-5" />
              Subscription Successful
            </DialogTitle>
            <DialogDescription>
              Your subscription has been activated successfully. You can now enjoy all the features of your plan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle>Payment Processed</AlertTitle>
              <AlertDescription>
                Thank you for subscribing. Your payment has been processed and your subscription is now active.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Canceled Dialog */}
      <Dialog open={showCanceledDialog} onOpenChange={setShowCanceledDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-amber-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Payment Canceled
            </DialogTitle>
            <DialogDescription>
              Your subscription payment was canceled. No charges have been made.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>You can try again whenever you're ready.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCanceledDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPage;

