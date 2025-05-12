import { useState, useEffect } from "react";
import { useBankDetails } from "@/hooks/useBankDetails";
import { CardPaymentSection } from "@/components/payment/CardPaymentSection";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CreditCard, Banknote, Pencil, Save } from "lucide-react";
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

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };
  return <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Settings</h2>
        <Button variant="default" size="sm" onClick={toggleEditMode} className="flex items-center gap-1">
          {isEditMode ? <>
              <Save className="h-4 w-4" />
              Save
            </> : <>
              <Pencil className="h-4 w-4" />
              Edit
            </>}
        </Button>
      </div>
      
      {/* Add Payment Method Buttons */}
      {isEditMode && <div className="flex flex-wrap gap-3 mb-6">
          
          
        </div>}

      {/* Subscription Payment Section */}
      <Card>
        <CardContent className="pt-6">
          <CardPaymentSection user={user} sharedBankAccount={sharedBankAccount} bankDetails={bankDetails} onBankDetailsChanged={fetchBankDetails} initialAddCardOpen={isAddPaymentOpen} initialAddBankOpen={isAddBankOpen} onAddCardOpenChange={setIsAddPaymentOpen} onAddBankOpenChange={setIsAddBankOpen} isEditMode={isEditMode} />
        </CardContent>
      </Card>
    </div>;
}