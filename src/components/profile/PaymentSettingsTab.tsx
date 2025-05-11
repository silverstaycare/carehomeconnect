
import { useState, useEffect } from "react";
import { useBankDetails } from "@/hooks/useBankDetails";
import { CardPaymentSection } from "@/components/payment/CardPaymentSection";
import { BankDetailsSection } from "@/components/payment/BankDetailsSection";

interface PaymentSettingsTabProps {
  user: any;
}

export function PaymentSettingsTab({ user }: PaymentSettingsTabProps) {
  const { bankDetails, fetchBankDetails } = useBankDetails(user?.id);
  const [sharedBankAccount, setSharedBankAccount] = useState(false);
  
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

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      {/* Subscription Payment Section */}
      <div className="mb-8">
        <CardPaymentSection 
          user={user} 
          sharedBankAccount={sharedBankAccount} 
          bankDetails={bankDetails}
        />
      </div>
      
      {/* Receive Payment Section */}
      <div>
        <BankDetailsSection 
          user={user} 
          onBankDetailsChanged={fetchBankDetails}
        />
      </div>
    </div>
  );
}
