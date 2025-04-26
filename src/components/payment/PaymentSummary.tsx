
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
            <span className="text-gray-600">Original Amount:</span>
            <span className="font-medium">${monthlyRate}</span>
          </div>
          {discountedRate && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-${(monthlyRate - discountedRate).toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between">
            <span className="font-medium">Total Amount:</span>
            <span className="font-bold text-xl">
              ${discountedRate || monthlyRate}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSummary;
