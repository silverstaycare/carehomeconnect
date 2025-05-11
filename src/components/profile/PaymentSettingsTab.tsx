
import { CardPaymentSection } from "@/components/payment/CardPaymentSection";
import { BankDetailsSection } from "@/components/payment/BankDetailsSection";

interface PaymentSettingsTabProps {
  user: any;
}

export function PaymentSettingsTab({ user }: PaymentSettingsTabProps) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      {/* Subscription Payment Section */}
      <div className="mb-8">
        <CardPaymentSection user={user} />
      </div>
      
      {/* Receive Payment Section */}
      <div>
        <BankDetailsSection user={user} />
      </div>
    </div>
  );
}
