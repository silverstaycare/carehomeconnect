
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CreditCard, Banknote } from "lucide-react";
import { PaymentMethod } from "@/services/paymentService";

interface PaymentMethodSelectProps {
  methods: PaymentMethod[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  label: string;
  disabled?: boolean;
}

export function PaymentMethodSelect({
  methods,
  selectedId,
  onSelect,
  label,
  disabled = false
}: PaymentMethodSelectProps) {
  const selectedMethod = methods.find(m => m.id === selectedId) || null;
  
  return (
    <div className="space-y-2">
      <Select 
        value={selectedId || ""} 
        onValueChange={onSelect}
        disabled={disabled || methods.length === 0}
      >
        <SelectTrigger className={`w-full ${disabled ? 'opacity-80' : ''}`}>
          <SelectValue placeholder="Select a payment method">
            {selectedMethod && (
              <div className="flex items-center">
                {selectedMethod.type === "card" ? (
                  <CreditCard className="mr-2 h-4 w-4 text-blue-600" />
                ) : (
                  <Banknote className="mr-2 h-4 w-4 text-green-600" />
                )}
                <span>
                  {selectedMethod.type === "card" 
                    ? `${selectedMethod.name} •••• ${selectedMethod.last4}` 
                    : `${selectedMethod.bank_name} (${selectedMethod.last4})`}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {methods.map((method) => (
            <SelectItem key={method.id} value={method.id || ""}>
              <div className="flex items-center">
                {method.type === "card" ? (
                  <CreditCard className="mr-2 h-4 w-4 text-blue-600" />
                ) : (
                  <Banknote className="mr-2 h-4 w-4 text-green-600" />
                )}
                <span>
                  {method.type === "card"
                    ? `${method.name} •••• ${method.last4}`
                    : `${method.bank_name} (${method.last4})`}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
