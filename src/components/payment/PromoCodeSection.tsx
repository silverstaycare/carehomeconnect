
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';

interface PromoCodeSectionProps {
  promoCode: string;
  setPromoCode: (value: string) => void;
}

const PromoCodeSection = ({ promoCode, setPromoCode }: PromoCodeSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Promo Code</CardTitle>
        <CardDescription>
          Have a promo code? Enter it below to apply a discount.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="promoCode">Promo Code</Label>
          <div className="relative">
            <Input
              id="promoCode"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => {
              console.log('Promo code:', promoCode);
            }}
          >
            Apply Promo Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromoCodeSection;
