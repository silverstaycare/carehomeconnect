import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentMethodsList } from "@/components/payment/PaymentMethodsList";
import { AddCardForm } from "@/components/payment/AddCardForm";
import { PaymentMethodSelect } from "@/components/payment/PaymentMethodSelect";
import { BankDetails } from "@/types/bank";

// Define the PaymentMethod interface to match what's expected
interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  name: string;
  last4?: string;
  bank_name?: string;
  exp_month?: number;
  exp_year?: number;
  isDefault?: boolean;
}

interface PaymentMethodManagerProps {
  user: any;
  sharedBankAccount?: boolean;
  bankDetails?: BankDetails | null;
  onBankDetailsChanged?: () => void;
}

export function PaymentMethodManager({ 
  user, 
  sharedBankAccount = false,
  bankDetails = null,
  onBankDetailsChanged 
}: PaymentMethodManagerProps) {
  // State
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [defaultPaymentId, setDefaultPaymentId] = useState<string | null>(null);
  const [selectedRentBankId, setSelectedRentBankId] = useState<string | null>(null);
  const [bankMethods, setBankMethods] = useState<PaymentMethod[]>([]);
  
  // Mock data for demo purposes
  useEffect(() => {
    // This would normally be fetched from an API
    const mockMethods: PaymentMethod[] = [
      { 
        id: "card_1", 
        type: "card", 
        name: "Visa", 
        last4: "4242", 
        exp_month: 12, 
        exp_year: 2025,
        isDefault: true
      },
      { 
        id: "card_2", 
        type: "card", 
        name: "Mastercard", 
        last4: "5555", 
        exp_month: 10, 
        exp_year: 2026,
        isDefault: false
      }
    ];
    
    // If we have bank details, add them to the mock payment methods
    if (bankDetails) {
      const bankMethod: PaymentMethod = {
        id: "bank_1",
        type: "bank",
        name: bankDetails.account_name,
        last4: bankDetails.account_number?.slice(-4),
        bank_name: bankDetails.bank_name,
        isDefault: false,
        // Add dummy values for exp_month and exp_year to satisfy the type
        exp_month: undefined,
        exp_year: undefined
      };
      
      mockMethods.push(bankMethod);
      setBankMethods([bankMethod]);
      
      if (sharedBankAccount) {
        setSelectedRentBankId("bank_1");
      }
    }
    
    setPaymentMethods(mockMethods);
    setDefaultPaymentId(mockMethods.find(m => m.isDefault)?.id || null);
  }, [bankDetails, sharedBankAccount]);
  
  // Handle setting default payment method
  const handleSetDefault = (id: string) => {
    // This would normally be an API call
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
    setDefaultPaymentId(id);
  };
  
  // Handle adding new payment method (mock)
  const handleAddPaymentMethod = (data: any) => {
    // This would normally be an API call
    console.log("Adding payment method:", data);
    // Close the dialog
    setIsAddPaymentOpen(false);
  };

  // Handle cancel action for the add payment form
  const handleCancel = () => {
    setIsAddPaymentOpen(false);
  };

  // Select bank account for rent payment
  const handleSelectRentBank = (id: string) => {
    setSelectedRentBankId(id);
    // This would normally update a setting in the backend
    console.log("Selected bank account for rent payments:", id);
  };

  // Open add card dialog
  const handleAddCardClick = () => {
    setIsAddPaymentOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Subscription Payment Methods Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
        <p className="text-gray-600 mb-4">
          Manage your payment methods for subscription payments
        </p>
        
        <PaymentMethodsList 
          methods={paymentMethods}
          onSetDefault={handleSetDefault}
          onAddCard={handleAddCardClick}
        />
        
        <Button
          variant="outline"
          onClick={() => setIsAddPaymentOpen(true)}
          className="mt-4 w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
        
        {/* Add Payment Method Dialog */}
        <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            
            <AddCardForm 
              onSubmit={handleAddPaymentMethod}
              isProcessing={isProcessing}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Separator for visual distinction */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium mb-4">Receive Rent Payment</h3>
        <p className="text-gray-600 mb-4">
          Select which bank account should receive rent payments
        </p>
        
        {bankMethods.length > 0 ? (
          <PaymentMethodSelect
            methods={bankMethods}
            selectedId={selectedRentBankId}
            onSelect={handleSelectRentBank}
            label=""
          />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center mb-4">
            <p className="text-gray-600">No bank accounts added yet</p>
          </div>
        )}
        
        {bankDetails?.use_for_both && (
          <p className="text-sm text-blue-600 mt-2">
            Using the same bank account for subscription payments and rent deposits
          </p>
        )}
      </div>
    </div>
  );
}
