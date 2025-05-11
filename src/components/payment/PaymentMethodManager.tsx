
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { PaymentMethodsList } from "@/components/payment/PaymentMethodsList";
import { PaymentMethodSelect } from "@/components/payment/PaymentMethodSelect";
import { AddCardForm } from "@/components/payment/AddCardForm";
import { AddBankForm } from "@/components/payment/AddBankForm";
import { useToast } from "@/hooks/use-toast";
import { BankDetails } from "@/types/bank";
import { supabase } from "@/integrations/supabase/client";

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
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const { toast } = useToast();

  // Populate payment methods when component mounts or bank details change
  useEffect(() => {
    const cardMethods: PaymentMethod[] = [
      {
        id: "card-1",
        type: "card",
        name: "Visa",
        last4: "4242",
        exp_month: 12,
        exp_year: 2025,
        isDefault: true
      }
    ];
    
    const methods = [...cardMethods];
    
    // Add bank details if they exist and are to be used for both payment types
    if (sharedBankAccount && bankDetails) {
      methods.push({
        id: `bank-${bankDetails.id}`,
        type: "bank",
        name: bankDetails.account_name || "",
        last4: bankDetails.account_number?.slice(-4) || "",
        bank_name: bankDetails.bank_name || "",
        isDefault: false
      });
    }
    
    setPaymentMethods(methods);
    
    // Set the default payment method
    if (!selectedPaymentMethod) {
      const defaultMethod = methods.find(m => m.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
      } else if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0].id);
      }
    }
  }, [bankDetails, sharedBankAccount]);

  // Handle adding a new card
  const handleAddCard = async (cardData: any) => {
    setIsProcessing(true);
    
    // Simulate API call to a secure payment processor
    setTimeout(() => {
      const newCard: PaymentMethod = {
        id: `card-${Math.floor(Math.random() * 1000)}`,
        type: "card",
        name: cardData.cardholderName,
        last4: cardData.cardNumber.slice(-4),
        exp_month: parseInt(cardData.expiryDate.split('/')[0]),
        exp_year: parseInt(`20${cardData.expiryDate.split('/')[1]}`),
        isDefault: false
      };
      
      toast({
        title: "Card added securely",
        description: "Your card has been securely tokenized and saved",
      });
      
      setPaymentMethods(prev => [...prev, newCard]);
      setIsProcessing(false);
      setIsAddCardOpen(false);
    }, 1500);
  };

  // Handle adding a new bank account
  const handleAddBank = async (bankData: any) => {
    if (!user) return;
    
    setIsProcessing(true);
    
    try {
      // Check if bank details already exist
      const { data: existingData, error: checkError } = await supabase
        .from("bank_details")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError; 
      }
      
      // Setup payload
      const bankPayload = {
        account_name: bankData.accountName,
        account_number: bankData.accountNumber,
        routing_number: bankData.routingNumber,
        bank_name: bankData.bankName,
        use_for_both: bankData.useForBoth || false
      };
      
      let updateError;
      
      if (existingData?.id) {
        // Update existing record
        const { error } = await supabase
          .from("bank_details")
          .update(bankPayload)
          .eq("id", existingData.id)
          .eq("user_id", user.id);
          
        updateError = error;
      } else {
        // Create new record
        const { error } = await supabase
          .from("bank_details")
          .insert({
            user_id: user.id,
            ...bankPayload
          });
          
        updateError = error;
      }
      
      if (updateError) throw updateError;
      
      toast({
        title: "Banking details updated",
        description: "Your banking information has been saved securely"
      });
      
      // Refresh bank details
      if (onBankDetailsChanged) {
        onBankDetailsChanged();
      }
      
      // Close the dialog
      setIsAddBankOpen(false);
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast({
        title: "Error",
        description: "Failed to update banking information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle setting a payment method as default
  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    
    setSelectedPaymentMethod(id);
    
    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been updated successfully"
    });
  };

  return (
    <div className="space-y-6">
      {/* Add Payment Method Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          variant="outline"
          onClick={() => setIsAddCardOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> 
          Add Card
        </Button>
        
        {!sharedBankAccount && (
          <Button
            variant="outline"
            onClick={() => setIsAddBankOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Bank Account
          </Button>
        )}
      </div>
      
      {/* Payment Methods List */}
      <PaymentMethodsList 
        methods={paymentMethods} 
        onSetDefault={handleSetDefaultPayment} 
        onEdit={(id) => {
          const method = paymentMethods.find(m => m.id === id);
          if (method?.type === "card") {
            setIsAddCardOpen(true);
          } else {
            setIsAddBankOpen(true);
          }
        }}
      />
      
      {/* Payment Method Selection */}
      <div className="mt-8 space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Default Payment Methods</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <PaymentMethodSelect 
            methods={paymentMethods}
            selectedId={selectedPaymentMethod}
            onSelect={setSelectedPaymentMethod}
            label="Subscription Payment Method"
          />
          
          {/* Only show bank accounts for receiving payments */}
          <PaymentMethodSelect 
            methods={paymentMethods.filter(m => m.type === "bank")}
            selectedId={paymentMethods.find(m => m.type === "bank")?.id || null}
            onSelect={(id) => {
              // Logic to set selected bank account
              toast({
                title: "Receive payment method updated",
                description: "Your default receive payment method has been updated"
              });
            }}
            label="Receive Payment Method"
          />
        </div>
      </div>

      {/* Add Card Dialog */}
      <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Card</DialogTitle>
          </DialogHeader>
          <AddCardForm 
            onSubmit={handleAddCard} 
            isProcessing={isProcessing} 
            onCancel={() => setIsAddCardOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Add Bank Details Dialog - only shown if not using shared bank details */}
      {!sharedBankAccount && (
        <Dialog open={isAddBankOpen} onOpenChange={setIsAddBankOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Bank Account</DialogTitle>
            </DialogHeader>
            <AddBankForm 
              onSubmit={handleAddBank} 
              isProcessing={isProcessing}
              defaultValues={{
                accountName: "",
                accountNumber: "",
                routingNumber: "",
                bankName: ""
              }}
              useForBoth={false}
              onUseForBothChange={() => {}}
              onCancel={() => setIsAddBankOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
