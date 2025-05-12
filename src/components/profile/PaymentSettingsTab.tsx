
import { useState, useEffect } from "react";
import { useBankDetails } from "@/hooks/useBankDetails";
import { CardPaymentSection } from "@/components/payment/CardPaymentSection";
import { 
  Card, 
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CreditCard, Banknote } from "lucide-react";

interface PaymentSettingsTabProps {
  user: any;
}

export function PaymentSettingsTab({ user }: PaymentSettingsTabProps) {
  const { bankDetails, fetchBankDetails } = useBankDetails(user?.id);
  const [sharedBankAccount, setSharedBankAccount] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  
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

  return (
    <div className="space-y-6">
      {/* Add Payment Method Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button 
          variant="outline" 
          onClick={handleAddCardClick}
          className="flex items-center gap-2"
        >
          <CreditCard className="h-4 w-4" />
          Add Payment Card
        </Button>
        <Button 
          variant="outline" 
          onClick={handleAddBankClick}
          className="flex items-center gap-2"
        >
          <Banknote className="h-4 w-4" />
          Add Bank Account
        </Button>
      </div>

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
          />
        </CardContent>
      </Card>
    </div>
  );
}
