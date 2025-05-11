
import { CardPaymentSection } from "@/components/payment/CardPaymentSection";
import { BankDetailsSection } from "@/components/payment/BankDetailsSection";

interface PaymentSettingsTabProps {
  user: any;
}

export function PaymentSettingsTab({ user }: PaymentSettingsTabProps) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Payment Settings</h2>
      
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
