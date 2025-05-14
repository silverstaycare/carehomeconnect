
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export const usePromoCode = () => {
  const { toast } = useToast();
  const [promoCodeApplied, setPromoCodeApplied] = useState<string | null>(null);

  const handlePromoCode = (code: string) => {
    setPromoCodeApplied(code);
    toast({
      title: "Promo Code Applied",
      description: `The promo code "${code}" has been applied to your subscription.`,
    });
  };

  return {
    promoCodeApplied,
    handlePromoCode
  };
};
