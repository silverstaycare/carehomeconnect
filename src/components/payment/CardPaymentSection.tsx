
import React, { forwardRef, ForwardRefRenderFunction } from "react";
import { PaymentMethodManager } from "@/components/payment/PaymentMethodManager";
import { BankDetailsSection } from "@/components/payment/BankDetailsSection";
import { BankDetails } from "@/types/bank";

interface CardPaymentSectionProps {
  user: any;
  sharedBankAccount?: boolean;
  bankDetails?: BankDetails | null;
  onBankDetailsChanged?: () => void;
  initialAddCardOpen?: boolean;
  initialAddBankOpen?: boolean;
  onAddCardOpenChange?: (isOpen: boolean) => void;
  onAddBankOpenChange?: (isOpen: boolean) => void;
  isEditMode?: boolean;
}

// Create the forwarded ref component
const CardPaymentSectionComponent: ForwardRefRenderFunction<any, CardPaymentSectionProps> = ({ 
  user,
  sharedBankAccount = false,
  bankDetails = null,
  onBankDetailsChanged,
  initialAddCardOpen = false,
  initialAddBankOpen = false,
  onAddCardOpenChange,
  onAddBankOpenChange,
  isEditMode = false
}, ref) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Payment Methods</h3>
        <p className="text-gray-600 mb-6">
          Manage your payment cards and bank accounts
        </p>
        
        <PaymentMethodManager 
          user={user} 
          sharedBankAccount={sharedBankAccount} 
          bankDetails={bankDetails}
          onBankDetailsChanged={onBankDetailsChanged}
          initialAddCardOpen={initialAddCardOpen}
          initialAddBankOpen={initialAddBankOpen}
          onAddCardOpenChange={onAddCardOpenChange}
          onAddBankOpenChange={onAddBankOpenChange}
          isEditMode={isEditMode}
          ref={ref}
        />
      </div>
    </div>
  );
};

// Export the component with forwardRef
export const CardPaymentSection = forwardRef(CardPaymentSectionComponent);
