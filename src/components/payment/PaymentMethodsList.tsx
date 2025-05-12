
import React from 'react';
import { CreditCard, Banknote, Plus, Pencil } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { PaymentMethod } from '@/services/paymentService';

interface PaymentMethodsListProps {
  methods: PaymentMethod[];
  onEdit?: (id: string) => void;
  onAddCard?: () => void;
  onAddBank?: () => void;
  isEditMode?: boolean;
  isOwner?: boolean;
}

export function PaymentMethodsList({
  methods,
  onEdit,
  onAddCard,
  onAddBank,
  isEditMode = false,
  isOwner = false
}: PaymentMethodsListProps) {
  // Group methods by type
  const cardMethods = methods.filter(method => method.type === 'card');
  const bankMethods = methods.filter(method => method.type === 'bank');
  
  return (
    <div className="space-y-6">
      {/* Cards Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-700">Payment Cards</h4>
          {onAddCard && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAddCard}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <CreditCard className="h-4 w-4" />
              Add Card
            </Button>
          )}
        </div>
        
        {cardMethods.length > 0 ? (
          <div className="space-y-2">
            {cardMethods.map((method) => (
              <div 
                key={method.id} 
                className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className="bg-blue-50 p-2 rounded mr-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-gray-500">
                      •••• {method.last4} 
                      {method.exp_month && method.exp_year && ` • Expires ${String(method.exp_month).padStart(2, '0')}/${String(method.exp_year).slice(-2)}`}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {method.is_for_subscription && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          Selected for subscription
                        </span>
                      )}
                      {method.is_for_payment && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                          Payment method
                        </span>
                      )}
                      {method.id?.toString().startsWith('temp-') && (
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                          Not saved yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {isEditMode && onEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEdit(method.id as string)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 border border-dashed rounded-md bg-gray-50">
            <p className="text-gray-500">No payment cards added yet</p>
            {isEditMode && onAddCard && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onAddCard}
                className="mt-3"
              >
                Add Payment Card
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Bank Accounts Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-700">Bank Accounts</h4>
          {onAddBank && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAddBank}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <Banknote className="h-4 w-4" />
              Add Bank
            </Button>
          )}
        </div>
        
        {bankMethods.length > 0 ? (
          <div className="space-y-2">
            {bankMethods.map((method) => (
              <div 
                key={method.id} 
                className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className="bg-green-50 p-2 rounded mr-3">
                    <Banknote className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{method.bank_name}</p>
                    <p className="text-sm text-gray-500">
                      {method.name} • Account ending in {method.last4}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {method.is_for_subscription && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          Selected for subscription
                        </span>
                      )}
                      {method.is_for_rent && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                          Selected for rent
                        </span>
                      )}
                      {method.id?.toString().startsWith('temp-') && (
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                          Not saved yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {isEditMode && onEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEdit(method.id as string)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 border border-dashed rounded-md bg-gray-50">
            <p className="text-gray-500">No bank accounts added yet</p>
            {isEditMode && onAddBank && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onAddBank}
                className="mt-3"
              >
                Add Bank Account
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
