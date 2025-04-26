
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DollarSign } from 'lucide-react';

interface PaymentSummaryProps {
  monthlyRate: number;
  discountedRate: number | null;
}

const PaymentSummary = ({ monthlyRate, discountedRate }: PaymentSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Rent per month:</span>
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
            <span className="font-medium">Total Rent Amount:</span>
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
