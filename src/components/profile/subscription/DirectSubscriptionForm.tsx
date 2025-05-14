
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Check, CreditCard } from "lucide-react";

interface DirectSubscriptionFormProps {
  user: any;
  numberOfBeds: number;
  pricePerBed: number;
  onCancel: () => void;
  onSubscriptionComplete: () => void;
}

export function DirectSubscriptionForm({ 
  user, 
  numberOfBeds, 
  pricePerBed,
  onCancel,
  onSubscriptionComplete
}: DirectSubscriptionFormProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const totalPrice = (pricePerBed * numberOfBeds).toFixed(2);
  
  // Features list
  const features = [
    'List your care home',
    'Profile with photos, description, and pricing',
    'Online booking inquiry form',
    'Email notifications for inquiries',
    'Analytics dashboard (views, inquiries)',
    'Priority placement in search results'
  ];
  
  // Handle subscribe button click
  const handleSubscribe = async () => {
    try {
      setIsProcessing(true);
      
      // Create a checkout session through the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          numberOfBeds,
          successUrl: `${window.location.origin}/profile?subscribed=true`,
          cancelUrl: `${window.location.origin}/profile`,
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
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };
  
  return (
    <Card className="border-2 border-care-500">
      <CardHeader>
        <CardTitle>Subscribe to Care Home Listing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Display */}
        <div className="mb-6">
          <p className="text-2xl font-bold">
            ${pricePerBed}
            <span className="text-lg font-normal text-gray-600">/bed/month</span>
          </p>
          <p className="text-sm text-gray-600">Billed monthly, cancel anytime</p>
        </div>
        
        {/* Features */}
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        {/* Current Beds Summary */}
        <div className="bg-care-50 p-4 rounded-lg border border-care-100">
          <h3 className="font-medium mb-3">Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Number of Beds:</span>
              <span className="font-medium">{numberOfBeds}</span>
            </div>
            <div className="flex justify-between">
              <span>Rate Per Bed:</span>
              <span className="font-medium">${pricePerBed}</span>
            </div>
            <div className="border-t border-care-200 pt-2 mt-2 flex justify-between font-bold">
              <span>Total Monthly Cost:</span>
              <span>${totalPrice}</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="flex items-center"
          >
            {isProcessing ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Subscribe Now
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
