import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowUp, AlertTriangle, CreditCard, Plus, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Subscription } from "@/types/subscription";

interface PaymentSettingsTabProps {
  user: any;
}

const cardSchema = z.object({
  cardholderName: z.string().min(2, "Cardholder name is required"),
  cardNumber: z.string()
    .min(13, "Card number must be between 13-19 digits")
    .max(19, "Card number must be between 13-19 digits")
    .refine((val) => /^[0-9]+$/.test(val), "Card number must contain only digits"),
  expiryDate: z.string()
    .min(5, "Expiry date is required (MM/YY)")
    .max(5, "Expiry date must be in MM/YY format")
    .refine((val) => /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(val), "Expiry date must be in MM/YY format"),
  cvc: z.string()
    .min(3, "CVC must be 3-4 digits")
    .max(4, "CVC must be 3-4 digits")
    .refine((val) => /^[0-9]+$/.test(val), "CVC must contain only digits"),
});

type CardFormValues = z.infer<typeof cardSchema>;

interface PaymentCard {
  id: string;
  cardholder_name: string;
  last_four: string;
  expiry_date: string;
  card_type: string;
  is_default: boolean;
}

export function PaymentSettingsTab({ user }: PaymentSettingsTabProps) {
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const cardForm = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvc: ""
    }
  });

  // Check subscription status
  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      setIsCheckingSubscription(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  // Load subscription status and payment cards when component mounts
  useEffect(() => {
    checkSubscriptionStatus();
    fetchPaymentCards();
  }, [user]);

  // Fetch saved payment cards
  const fetchPaymentCards = async () => {
    if (!user) return;
    
    try {
      setIsLoadingCards(true);
      
      // Here we would normally fetch cards from Stripe via an edge function
      // For now, we'll simulate with mock data
      const mockCards: PaymentCard[] = [
        {
          id: "card_1",
          cardholder_name: "John Smith",
          last_four: "4242",
          expiry_date: "12/25",
          card_type: "Visa",
          is_default: true
        }
      ];
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPaymentCards(mockCards);
    } catch (error) {
      console.error("Error fetching payment cards:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCards(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsManagingSubscription(true);
      
      // First try customer portal
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error("Error accessing customer portal:", error);
        
        // If customer portal fails, redirect to subscription page instead as fallback
        navigate("/owner/subscription");
        
        toast({
          title: "Redirecting",
          description: "Opening subscription management page",
        });
        
        return;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        // If no URL was returned, use fallback
        navigate("/owner/subscription");
      }
    } catch (error) {
      console.error("Error accessing customer portal:", error);
      
      // Fallback to subscription page if anything fails
      navigate("/owner/subscription");
      
      toast({
        title: "Redirecting",
        description: "Opening subscription management page",
      });
    } finally {
      setIsManagingSubscription(false);
    }
  };

  const handleNavigateToSubscriptions = () => {
    navigate("/owner/subscription");
  };

  const handleUpgradeSubscription = () => {
    navigate("/owner/subscription", { state: { upgradeIntent: true } });
  };

  const getFeaturesList = (plan: string): string[] => {
    if (plan === 'basic') {
      return [
        'List your care home',
        'Basic profile (photos, description, pricing)',
        'Inquiries sent to email',
        'Limited to 1 active listing per home'
      ];
    } else if (plan === 'pro') {
      return [
        'Everything in Starter',
        'Priority placement in search results',
        'SMS/Email lead notifications',
        'Online booking inquiry form',
        'Up to 5 homes/properties',
        'Analytics dashboard'
      ];
    }
    return []; // Default empty list
  };

  // Format card number with spaces
  const formatCardNumber = (value: string): string => {
    const val = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = val.match(/.{1,4}/g);
    return matches ? matches.join(' ') : value;
  };

  // Format expiry date with slash
  const formatExpiryDate = (value: string): string => {
    const val = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (val.length >= 2) {
      return `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    return val;
  };

  // Handle card form submission
  const onSubmitCard = async (data: CardFormValues) => {
    if (!user) return;
    
    setIsProcessingCard(true);
    
    try {
      // In a real implementation, we would call a Stripe edge function
      // to tokenize and save the card securely
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add new card to state (in real app, we'd fetch from API)
      const newCard: PaymentCard = {
        id: `card_${Date.now()}`,
        cardholder_name: data.cardholderName,
        last_four: data.cardNumber.slice(-4),
        expiry_date: data.expiryDate,
        card_type: getCardType(data.cardNumber),
        is_default: paymentCards.length === 0 // Make default if first card
      };
      
      setPaymentCards([...paymentCards, newCard]);
      
      toast({
        title: "Card added",
        description: "Your payment method has been saved"
      });
      
      // Reset form and close dialog
      cardForm.reset();
      setIsAddCardOpen(false);
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast({
        title: "Error",
        description: "Failed to save payment method",
        variant: "destructive",
      });
    } finally {
      setIsProcessingCard(false);
    }
  };

  // Determine card type from number
  const getCardType = (cardNumber: string): string => {
    const firstDigit = cardNumber.charAt(0);
    
    if (cardNumber.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(cardNumber)) return 'Mastercard';
    if (/^3[47]/.test(cardNumber)) return 'American Express';
    if (/^6(?:011|5)/.test(cardNumber)) return 'Discover';
    
    return 'Card';
  };

  // Remove payment card
  const handleRemoveCard = async (cardId: string) => {
    try {
      // In a real implementation, we would call a Stripe edge function
      // to remove the card securely
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove card from state
      setPaymentCards(paymentCards.filter(card => card.id !== cardId));
      
      toast({
        title: "Card removed",
        description: "Your payment method has been removed"
      });
    } catch (error) {
      console.error("Error removing payment method:", error);
      toast({
        title: "Error",
        description: "Failed to remove payment method",
        variant: "destructive",
      });
    }
  };

  // Set card as default
  const handleSetDefaultCard = async (cardId: string) => {
    try {
      // In a real implementation, we would call a Stripe edge function
      // to set the default card
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update cards in state
      setPaymentCards(paymentCards.map(card => ({
        ...card,
        is_default: card.id === cardId
      })));
      
      toast({
        title: "Default updated",
        description: "Your default payment method has been updated"
      });
    } catch (error) {
      console.error("Error setting default payment method:", error);
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Subscription Management</h2>
      
      {isCheckingSubscription ? (
        <div className="flex items-center justify-center p-8">
          <Spinner size="lg" />
          <p className="ml-3 text-gray-600">Checking subscription status...</p>
        </div>
      ) : subscription?.subscribed ? (
        <div className="space-y-6">
          {subscription.subscription?.planId === 'basic' && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6 flex justify-between items-center">
              <div>
                <h3 className="font-medium text-amber-800">Upgrade Available</h3>
                <p className="text-amber-700">
                  Unlock more features with our Pro plan
                </p>
              </div>
              <Button 
                onClick={handleUpgradeSubscription}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </div>
          )}
          
          <Card className={`border-2 ${subscription.subscription?.planId === 'pro' ? 'border-care-500' : 'border-blue-400'}`}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-xl">
                      {subscription.subscription?.planId === 'basic' ? 'Starter' : 'Pro'} Plan
                    </h3>
                    <Badge className={`${subscription.subscription?.planId === 'pro' ? 'bg-care-500' : 'bg-blue-400'}`}>
                      Active
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-4">
                    ${subscription.subscription?.planId === 'basic' ? '59.99' : '79.99'}/month per bed
                    {subscription.subscription?.numberOfBeds > 1 && ` × ${subscription.subscription?.numberOfBeds} beds`}
                    {subscription.subscription?.hasBoost && ' + $49.99 boost'}
                  </p>
                </div>
                {subscription.subscription?.planId === 'pro' && (
                  <Badge className="bg-green-600">Recommended</Badge>
                )}
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="font-medium text-gray-700">Features:</p>
                <ul className="space-y-1">
                  {getFeaturesList(subscription.subscription?.planId).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Next billing date:</span>
                  <span className="font-medium">
                    {subscription.subscription?.currentPeriodEnd && new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
                {subscription.subscription?.hasBoost && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visibility boost:</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                )}
                
                <div className="flex flex-col space-y-2 mt-3 pt-3 border-t border-gray-200">
                  {subscription.subscription?.numberOfBeds > 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        ${subscription.subscription?.planId === 'basic' ? '59.99' : '79.99'} × {subscription.subscription?.numberOfBeds} beds:
                      </span>
                      <span className="font-medium">
                        ${((subscription.subscription?.planId === 'basic' ? 59.99 : 79.99) * subscription.subscription?.numberOfBeds).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {subscription.subscription?.hasBoost && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Visibility boost:</span>
                      <span className="font-medium">$49.99</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Total monthly payment:</span>
                    <span className="font-bold text-care-600">
                      ${calculateTotalMonthly(subscription.subscription)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Payment Methods Section */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Payment Methods</h3>
            
            {isLoadingCards ? (
              <div className="flex items-center justify-center p-4">
                <Spinner size="sm" />
                <p className="ml-3 text-gray-600">Loading payment methods...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentCards.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                    <p className="text-gray-600">No payment methods added yet</p>
                  </div>
                ) : (
                  paymentCards.map((card) => (
                    <div key={card.id} className="flex items-center justify-between border rounded-md p-4">
                      <div className="flex items-center">
                        <div className="bg-blue-50 p-2 rounded mr-4">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {card.card_type} •••• {card.last_four}
                            {card.is_default && (
                              <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Default</Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {card.cardholder_name} • Expires {card.expiry_date}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!card.is_default && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetDefaultCard(card.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemoveCard(card.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setIsAddCardOpen(true)}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <Button 
              variant="outline" 
              onClick={checkSubscriptionStatus}
              size="sm"
            >
              Refresh Status
            </Button>
            
            <Button 
              onClick={handleManageSubscription}
              disabled={isManagingSubscription}
            >
              {isManagingSubscription ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Please wait...
                </>
              ) : (
                "Manage Subscription"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border border-amber-200 bg-amber-50 rounded-md p-4">
            <h3 className="font-medium text-amber-800">No Active Subscription</h3>
            <p className="text-amber-700">
              You don't have an active subscription. Subscribe to list your properties.
            </p>
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={checkSubscriptionStatus}
              size="sm"
            >
              Refresh Status
            </Button>
            
            <Button onClick={handleNavigateToSubscriptions}>
              View Subscription Plans
            </Button>
          </div>
        </div>
      )}

      {/* Add Payment Method Dialog */}
      <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          
          <Form {...cardForm}>
            <form onSubmit={cardForm.handleSubmit(onSubmitCard)} className="space-y-4">
              <FormField
                control={cardForm.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name on card" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={cardForm.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="1234 5678 9012 3456" 
                        value={formatCardNumber(field.value)}
                        onChange={(e) => {
                          const formatted = e.target.value.replace(/\s+/g, '').slice(0, 19);
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={cardForm.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="MM/YY" 
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                            field.onChange(formatExpiryDate(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={cardForm.control}
                  name="cvc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVC</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123" 
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddCardOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isProcessingCard}>
                  {isProcessingCard ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Card"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
  
  function calculateTotalMonthly(subscriptionData: any): string {
    if (!subscriptionData) return "0.00";
    
    const pricePerBed = subscriptionData.planId === 'basic' ? 59.99 : 79.99;
    const numberOfBeds = subscriptionData.numberOfBeds || 1;
    const boostPrice = subscriptionData.hasBoost ? 49.99 : 0;
    
    const total = (pricePerBed * numberOfBeds) + boostPrice;
    return total.toFixed(2);
  }
}
