
import { useState, useEffect, forwardRef, ForwardRefRenderFunction, useImperativeHandle } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentMethodsList } from "@/components/payment/PaymentMethodsList";
import { AddCardForm, CardFormValues } from "@/components/payment/AddCardForm";
import { PaymentMethodSelect } from "@/components/payment/PaymentMethodSelect";
import { BankDetails } from "@/types/bank";
import { AddBankForm } from "@/components/payment/AddBankForm";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { PaymentMethod } from "@/services/paymentService";
import { Spinner } from "@/components/ui/spinner";

interface PaymentMethodManagerProps {
  user: any;
  sharedBankAccount?: boolean;
  bankDetails?: BankDetails | null;
  onBankDetailsChanged?: () => void;
  initialAddCardOpen?: boolean;
  initialAddBankOpen?: boolean;
  onAddCardOpenChange?: (isOpen: boolean) => void;
  onAddBankOpenChange?: (isOpen: boolean) => void;
  isEditMode?: boolean;
}

// Create a forwarded ref component
const PaymentMethodManagerComponent: ForwardRefRenderFunction<any, PaymentMethodManagerProps> = ({
  user,
  sharedBankAccount = false,
  bankDetails = null,
  onBankDetailsChanged,
  initialAddCardOpen = false,
  initialAddBankOpen = false,
  onAddCardOpenChange,
  onAddBankOpenChange,
  isEditMode = false
}, ref) => {
  // States
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(initialAddCardOpen);
  const [isAddBankOpen, setIsAddBankOpen] = useState(initialAddBankOpen);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useForBoth, setUseForBoth] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentCardData, setCurrentCardData] = useState<Partial<CardFormValues> | null>(null);
  const [currentBankData, setCurrentBankData] = useState<any>(null);
  // Track local selected values separately from DB defaults
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [selectedRentBankId, setSelectedRentBankId] = useState<string | null>(null);

  // Use the payment methods hook
  const {
    paymentMethods,
    isLoading,
    addPaymentMethod,
    updatePaymentMethod,
    setDefaultMethod,
    setDefaultSubscriptionMethod,
    setDefaultRentMethod,
    getCardMethods,
    getBankMethods,
    getDefaultMethod,
    getDefaultSubscriptionMethod,
    getDefaultRentMethod
  } = usePaymentMethods(user?.id);

  // Expose methods to parent component using the ref
  useImperativeHandle(ref, () => ({
    savePaymentMethodSelections,
    getSelectedSubscriptionId: () => selectedSubscriptionId,
    getSelectedRentBankId: () => selectedRentBankId,
    setSelectedSubscriptionId,
    setSelectedRentBankId
  }));

  // Effect to sync the dialog state with parent component
  useEffect(() => {
    setIsAddPaymentOpen(initialAddCardOpen);
  }, [initialAddCardOpen]);

  useEffect(() => {
    setIsAddBankOpen(initialAddBankOpen);
  }, [initialAddBankOpen]);

  // Effect to notify parent component when dialog state changes
  useEffect(() => {
    if (onAddCardOpenChange) {
      onAddCardOpenChange(isAddPaymentOpen);
    }
  }, [isAddPaymentOpen, onAddCardOpenChange]);

  useEffect(() => {
    if (onAddBankOpenChange) {
      onAddBankOpenChange(isAddBankOpen);
    }
  }, [isAddBankOpen, onAddBankOpenChange]);

  // Initialize local state with DB values when payment methods load
  useEffect(() => {
    if (paymentMethods.length > 0) {
      const subscriptionDefault = getDefaultSubscriptionMethod();
      const rentDefault = getDefaultRentMethod();
      
      setSelectedSubscriptionId(subscriptionDefault?.id || null);
      setSelectedRentBankId(rentDefault?.id || null);
    }
  }, [paymentMethods]);

  // Handle setting default payment method
  const handleSetDefault = async (id: string) => {
    await setDefaultMethod(id);
  };

  // Handle editing a payment method
  const handleEdit = (id: string) => {
    if (!isEditMode) return;
    
    const method = paymentMethods.find(m => m.id === id);
    if (!method) return;
    
    setEditingId(id);
    if (method.type === 'card') {
      // Prepare card data for editing
      setCurrentCardData({
        cardholderName: method.name || '',
        cardNumber: `**** **** **** ${method.last4 || ''}`,
        expiryDate: method.exp_month && method.exp_year 
          ? `${String(method.exp_month).padStart(2, '0')}/${String(method.exp_year).slice(-2)}` 
          : '',
        cvv: ''
      });
      setCurrentBankData(null);
      setIsAddPaymentOpen(true);
    } else if (method.type === 'bank') {
      // Prepare bank data for editing
      setCurrentBankData({
        accountName: method.name || '',
        accountNumber: `**** **** **** ${method.last4 || ''}`,
        routingNumber: '', // We don't store the full routing number for security
        bankName: method.bank_name || ''
      });
      setCurrentCardData(null);
      // Check if bank account is used for both
      setUseForBoth(method.is_subscription_default === true && method.is_rent_default === true);
      setIsAddBankOpen(true);
    }
  };

  // Handle adding new payment method
  const handleAddPaymentMethod = async (data: any) => {
    setIsProcessing(true);
    
    try {
      const newCardMethod: PaymentMethod = {
        type: "card",
        name: data.cardholderName,
        last4: data.cardNumber.slice(-4),
        exp_month: parseInt(data.expiryDate.split('/')[0], 10),
        exp_year: parseInt(`20${data.expiryDate.split('/')[1]}`, 10),
      };
      
      if (editingId) {
        await updatePaymentMethod(editingId, newCardMethod);
      } else {
        await addPaymentMethod(newCardMethod);
      }
      
      // Close the dialog and reset state
      setIsAddPaymentOpen(false);
      setEditingId(null);
    } catch (error) {
      console.error("Error adding/updating payment method:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle adding new bank account
  const handleAddBankAccount = async (data: any) => {
    setIsProcessing(true);
    
    try {
      const bankMethod: PaymentMethod = {
        type: "bank",
        name: data.accountName,
        last4: data.accountNumber.slice(-4),
        bank_name: data.bankName,
        is_subscription_default: useForBoth ? true : undefined,
        is_rent_default: true
      };
      
      if (editingId) {
        await updatePaymentMethod(editingId, bankMethod);
      } else {
        await addPaymentMethod(bankMethod);
      }
      
      // Close the dialog and reset state
      setIsAddBankOpen(false);
      setEditingId(null);
      setCurrentBankData(null);
      
      if (onBankDetailsChanged) {
        onBankDetailsChanged();
      }
    } catch (error) {
      console.error("Error adding/updating bank account:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancel action for forms
  const handleCancel = () => {
    setIsAddPaymentOpen(false);
    setIsAddBankOpen(false);
    setEditingId(null);
    setCurrentCardData(null);
    setCurrentBankData(null);
  };

  // Select bank account for rent payment - use local state first, update DB on save
  const handleSelectRentBank = (id: string) => {
    setSelectedRentBankId(id);
    if (!isEditMode) {
      setDefaultRentMethod(id);
    }
  };

  // Select payment method for subscription - use local state first, update DB on save
  const handleSelectSubscription = (id: string) => {
    setSelectedSubscriptionId(id);
    if (!isEditMode) {
      setDefaultSubscriptionMethod(id);
    }
  };

  // Save changes to selected payment methods when exiting edit mode
  const savePaymentMethodSelections = async () => {
    if (selectedSubscriptionId) {
      await setDefaultSubscriptionMethod(selectedSubscriptionId);
    }
    
    if (selectedRentBankId) {
      await setDefaultRentMethod(selectedRentBankId);
    }
  };

  // Open add card dialog
  const handleAddCardClick = () => {
    setEditingId(null);
    setCurrentCardData(null);
    setCurrentBankData(null);
    setIsAddPaymentOpen(true);
  };

  // Open add bank dialog
  const handleAddBankClick = () => {
    setEditingId(null);
    setCurrentCardData(null);
    setCurrentBankData(null);
    setIsAddBankOpen(true);
  };

  // Get current values
  const cardMethods = getCardMethods();
  const bankMethods = getBankMethods();
  const defaultPaymentId = getDefaultMethod()?.id || null;
  
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Subscription Payment Methods Section */}
          <div>
            <PaymentMethodsList 
              methods={paymentMethods} 
              onSetDefault={handleSetDefault} 
              onEdit={handleEdit} 
              onAddCard={isEditMode ? handleAddCardClick : undefined} 
              onAddBank={isEditMode ? handleAddBankClick : undefined}
              isEditMode={isEditMode}
            />
            
            {/* Add Payment Method Dialog */}
            <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
                </DialogHeader>
                
                <AddCardForm 
                  onSubmit={handleAddPaymentMethod} 
                  isProcessing={isProcessing} 
                  onCancel={handleCancel} 
                  defaultValues={currentCardData}
                  isEditing={!!editingId}
                />
              </DialogContent>
            </Dialog>

            {/* Add Bank Account Dialog */}
            <Dialog open={isAddBankOpen} onOpenChange={setIsAddBankOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Bank Account" : "Add Bank Account"}</DialogTitle>
                </DialogHeader>
                
                <AddBankForm 
                  onSubmit={handleAddBankAccount} 
                  isProcessing={isProcessing} 
                  defaultValues={currentBankData || {
                    accountName: "",
                    accountNumber: "",
                    routingNumber: "",
                    bankName: ""
                  }} 
                  useForBoth={useForBoth} 
                  onUseForBothChange={setUseForBoth} 
                  onCancel={handleCancel}
                  isEditing={!!editingId}
                />
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Pay for Subscription Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">Pay for Subscription</h3>
            <p className="text-gray-600 mb-4">
              Select payment method for subscription
            </p>
            
            {paymentMethods.length > 0 ? 
              <PaymentMethodSelect 
                methods={paymentMethods} 
                selectedId={selectedSubscriptionId} 
                onSelect={handleSelectSubscription} 
                label=""
                disabled={!isEditMode}
              /> : 
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center mb-4">
                <p className="text-gray-600">No payment methods added yet</p>
                {isEditMode && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddCardClick}
                    className="mt-3"
                  >
                    Add Payment Method
                  </Button>
                )}
              </div>
            }
          </div>
          
          {/* Separator for visual distinction */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">Receive Rent Payment</h3>
            <p className="text-gray-600 mb-4">
              Select which bank account should receive rent payments
            </p>
            
            {bankMethods.length > 0 ? 
              <PaymentMethodSelect 
                methods={bankMethods} 
                selectedId={selectedRentBankId} 
                onSelect={handleSelectRentBank} 
                label=""
                disabled={!isEditMode}
              /> : 
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center mb-4">
                <p className="text-gray-600">No bank accounts added yet</p>
                {isEditMode && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddBankClick}
                    className="mt-3"
                  >
                    Add Bank Account
                  </Button>
                )}
              </div>
            }
            
            {useForBoth && <p className="text-sm text-blue-600 mt-2">
              Using the same bank account for subscription payments and rent deposits
            </p>}
          </div>
        </>
      )}
    </div>
  );
};

// Export the component with forwardRef
export const PaymentMethodManager = forwardRef(PaymentMethodManagerComponent);
