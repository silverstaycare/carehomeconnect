
import { useState, useEffect, useRef } from "react";
import { useBankDetails } from "@/hooks/useBankDetails";
import { CardPaymentSection } from "@/components/payment/CardPaymentSection";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CreditCard, Banknote, Pencil, Save } from "lucide-react";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { toast } from "sonner";

interface PaymentSettingsTabProps {
  user: any;
}

export function PaymentSettingsTab({
  user
}: PaymentSettingsTabProps) {
  const {
    bankDetails,
    fetchBankDetails
  } = useBankDetails(user?.id);
  const [sharedBankAccount, setSharedBankAccount] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Reference to the component instance to access its methods
  const paymentManagerRef = useRef<any>(null);
  
  // Get payment methods from hook
  const { 
    fetchPaymentMethods,
    setDefaultSubscriptionMethod, 
    setDefaultRentMethod,
    getDefaultSubscriptionMethod,
    getDefaultRentMethod
  } = usePaymentMethods(user?.id);

  // Check if bank details are shared between payment methods
  useEffect(() => {
    if (bankDetails) {
      setSharedBankAccount(bankDetails.use_for_both || false);
    }
  }, [bankDetails]);

  // Fetch bank details when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchBankDetails();
    }
  }, [user?.id, fetchBankDetails]);

  // Open add card dialog
  const handleAddCardClick = () => {
    setIsAddPaymentOpen(true);
  };

  // Open add bank dialog
  const handleAddBankClick = () => {
    setIsAddBankOpen(true);
  };

  // Toggle edit mode and save changes when exiting edit mode
  const toggleEditMode = async () => {
    if (isEditMode) {
      // Save changes when exiting edit mode
      try {
        const subscriptionMethodId = document.querySelector('[name="subscription-payment"]')?.getAttribute('data-value');
        const rentMethodId = document.querySelector('[name="rent-payment"]')?.getAttribute('data-value');
        
        if (subscriptionMethodId) {
          await setDefaultSubscriptionMethod(subscriptionMethodId);
        }
        
        if (rentMethodId) {
          await setDefaultRentMethod(rentMethodId);
        }
        
        // Refresh payment methods
        fetchPaymentMethods();
        
        toast.success("Payment preferences saved");
      } catch (error) {
        console.error("Error saving payment preferences:", error);
        toast.error("Failed to save payment preferences");
      }
    }
    
    setIsEditMode(!isEditMode);
  };
  
  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Settings</h2>
        <Button 
          variant="default" 
          size="sm" 
          onClick={toggleEditMode} 
          className="flex items-center gap-1"
        >
          {isEditMode ? (
            <>
              <Save className="h-4 w-4" />
              Save
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" />
              Edit
            </>
          )}
        </Button>
      </div>
      
      {/* Add Payment Method Buttons */}
      {isEditMode && (
        <div className="flex flex-wrap gap-3 mb-6">
          
        </div>
      )}

      {/* Subscription Payment Section */}
      <Card>
        <CardContent className="pt-6">
          <CardPaymentSection 
            user={user} 
            sharedBankAccount={sharedBankAccount} 
            bankDetails={bankDetails} 
            onBankDetailsChanged={fetchBankDetails} 
            initialAddCardOpen={isAddPaymentOpen} 
            initialAddBankOpen={isAddBankOpen} 
            onAddCardOpenChange={setIsAddPaymentOpen} 
            onAddBankOpenChange={setIsAddBankOpen} 
            isEditMode={isEditMode} 
            ref={paymentManagerRef}
          />
        </CardContent>
      </Card>
    </div>
  );
}
