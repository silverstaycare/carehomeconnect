
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Subscription } from "@/types/subscription";
import { SuccessDialog } from "./SuccessDialog";
import { CanceledDialog } from "./CanceledDialog";
import { SubscriptionPageHeader } from "./SubscriptionPageHeader";
import { SingleSubscriptionOption } from "./SingleSubscriptionOption";
import { PromoCodeBox } from "./PromoCodeBox";

const SubscriptionManager = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [boostEnabled, setBoostEnabled] = useState(false);
  const [numberOfBeds, setNumberOfBeds] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showCanceledDialog, setShowCanceledDialog] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  // Price per bed per month
  const pricePerBed = 19.99;

  useEffect(() => {
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
          status: data.subscription.status,
          currentPeriodEnd: data.subscription.currentPeriodEnd,
          numberOfBeds: data.subscription.numberOfBeds
        });
        
        // Set the UI to match the current subscription
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

  const calculateTotalPrice = () => {
    const total = pricePerBed * numberOfBeds;
    return total.toFixed(2);
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to subscribe",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Create a checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          numberOfBeds,
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
    <>
      <SubscriptionPageHeader 
        checkingSubscription={checkingSubscription}
        currentSubscription={currentSubscription}
        numberOfBeds={numberOfBeds}
        onBedsChange={setNumberOfBeds}
        pricePerBed={pricePerBed}
      />

      <PromoCodeBox onApplyPromo={handlePromoCode} />

      <SingleSubscriptionOption 
        pricePerBed={pricePerBed}
        numberOfBeds={numberOfBeds}
        totalPrice={Number(calculateTotalPrice())}
        currentSubscription={currentSubscription}
        isProcessing={isProcessing}
        onSubscribe={handleSubscribe}
        onManage={handleManageSubscription}
      />

      <SuccessDialog 
        open={showSuccessDialog} 
        onOpenChange={setShowSuccessDialog} 
      />
      
      <CanceledDialog 
        open={showCanceledDialog} 
        onOpenChange={setShowCanceledDialog} 
      />
    </>
  );
};

export default SubscriptionManager;
