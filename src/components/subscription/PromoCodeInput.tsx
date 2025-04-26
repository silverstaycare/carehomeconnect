
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PromoCodeInputProps {
  onPromoCodeApplied: (discountPercentage: number) => void;
}

export const PromoCodeInput = ({ onPromoCodeApplied }: PromoCodeInputProps) => {
  const [promoCode, setPromoCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const handleApplyPromoCode = async () => {
    if (!promoCode) return;
    
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .rpc('check_promo_code', { code_input: promoCode });

      if (error) throw error;

      const result = data[0];
      if (result.is_valid) {
        toast({
          title: "Success!",
          description: `Promo code applied: ${result.discount_percentage}% discount`,
        });
        onPromoCodeApplied(result.discount_percentage);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid promo code",
          description: result.message,
        });
        onPromoCodeApplied(0);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to validate promo code. Please try again.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="promo-code" className="text-sm font-medium">
        Promo Code
      </label>
      <div className="flex gap-2">
        <Input
          id="promo-code"
          placeholder="Enter promo code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          className="flex-1"
        />
        <Button 
          onClick={handleApplyPromoCode}
          disabled={!promoCode || isChecking}
          variant="outline"
        >
          Apply
        </Button>
      </div>
    </div>
  );
};
