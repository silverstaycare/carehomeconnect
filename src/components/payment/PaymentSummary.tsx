
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bed, DollarSign } from 'lucide-react';

interface PaymentSummaryProps {
  monthlyRate: number;
  discountedRate: number | null;
  numberOfBeds?: number;
  pricePerBed?: number;
  tierName?: string;
}

const PaymentSummary = ({ 
  monthlyRate, 
  discountedRate, 
  numberOfBeds = 1,
  pricePerBed = monthlyRate,
  tierName = "Standard"
}: PaymentSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <span>{tierName} Tier</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4" />
                <span className="text-gray-600">Cost per bed:</span>
              </div>
              <span className="font-medium">${pricePerBed.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Number of beds:</span>
              <span className="font-medium">× {numberOfBeds}</span>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <span className="text-gray-600">Original Amount:</span>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">{monthlyRate.toFixed(2)}</span>
            </div>
          </div>

          {discountedRate && (
            <div className="flex justify-between text-green-600">
              <span>Promo Discount:</span>
              <span>-${(monthlyRate - discountedRate).toFixed(2)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between">
            <span className="font-medium">Total Amount:</span>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-bold text-xl">
                {(discountedRate || monthlyRate).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSummary;
