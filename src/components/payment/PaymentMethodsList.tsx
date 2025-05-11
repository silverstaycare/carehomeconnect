
import { CreditCard, Banknote, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface PaymentMethodsListProps {
  methods: PaymentMethod[];
  onSetDefault: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function PaymentMethodsList({
  methods,
  onSetDefault,
  onEdit
}: PaymentMethodsListProps) {
  if (methods.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center mb-4">
        <p className="text-gray-600">No payment methods added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {methods.map((method) => (
        <div key={method.id} className="border rounded-md p-4">
          <div className="flex items-center">
            <div className={`${method.type === "card" ? "bg-blue-50" : "bg-green-50"} p-2 rounded mr-4`}>
              {method.type === "card" ? (
                <CreditCard className="h-5 w-5 text-blue-600" />
              ) : (
                <Banknote className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div className="flex-1">
              {method.type === "card" ? (
                <>
                  <p className="font-medium">{method.name} •••• {method.last4}</p>
                  <p className="text-sm text-gray-500">
                    Expires {method.exp_month}/{method.exp_year}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">{method.bank_name}</p>
                  <p className="text-sm text-gray-500">
                    {method.name} • Account ending in {method.last4}
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(method.id)}
                >
                  Edit
                </Button>
              )}
              <Button 
                variant={method.isDefault ? "default" : "outline"} 
                size="sm"
                onClick={() => onSetDefault(method.id)}
                className={method.isDefault ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {method.isDefault ? (
                  <>
                    <Check className="mr-1 h-3 w-3" />
                    Default
                  </>
                ) : "Set Default"}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
