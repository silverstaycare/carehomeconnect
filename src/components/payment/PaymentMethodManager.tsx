
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
import { toast } from "sonner";

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
  isOwner?: boolean;
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
  isEditMode = false,
  isOwner = false
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
  // Track if selections have changed from initial DB values
  const [hasSelectionChanged, setHasSelectionChanged] = useState(false);
  // Track new payment methods added in edit mode (for family users)
  const [newPaymentMethods, setNewPaymentMethods] = useState<PaymentMethod[]>([]);

  // Use the payment methods hook
  const {
    paymentMethods,
    isLoading,
    fetchPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
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
    saveNewPaymentMethods,
    getSelectedSubscriptionId: () => selectedSubscriptionId,
    getSelectedRentBankId: () => selectedRentBankId,
    setSelectedSubscriptionId,
    setSelectedRentBankId,
    hasChanges: () => hasSelectionChanged || newPaymentMethods.length > 0,
    getNewPaymentMethods: () => newPaymentMethods
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
      
      if (subscriptionDefault?.id) {
        setSelectedSubscriptionId(subscriptionDefault.id);
      }
      
      if (rentDefault?.id) {
        setSelectedRentBankId(rentDefault.id);
      }
      
      // Reset the selection changed state when we load from DB
      setHasSelectionChanged(false);
      // Clear any temporary payment methods
      setNewPaymentMethods([]);
    }
  }, [paymentMethods, getDefaultSubscriptionMethod, getDefaultRentMethod]);

  // Handle editing a payment method
  const handleEdit = (id: string) => {
    if (!isEditMode) return;
    
    // Check both database payment methods and temporary new ones
    let method = paymentMethods.find(m => m.id === id);
    
    if (!method) {
      method = newPaymentMethods.find(m => m.id === id);
    }
    
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
      setUseForBoth(method.is_for_subscription === true && method.is_for_rent === true);
      setIsAddBankOpen(true);
    }
  };

  // Generate temporary ID for new payment methods
  const generateTempId = () => {
    return `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  // Handle adding new payment method
  const handleAddPaymentMethod = async (data: any) => {
    setIsProcessing(true);
    
    try {
      const newCardMethod: PaymentMethod = {
        id: editingId || generateTempId(),
        type: "card",
        name: data.cardholderName,
        last4: data.cardNumber.slice(-4),
        exp_month: parseInt(data.expiryDate.split('/')[0], 10),
        exp_year: parseInt(`20${data.expiryDate.split('/')[1]}`, 10),
        is_for_payment: true,
      };

      if (isEditMode && !editingId?.startsWith('temp-')) {
        // If in edit mode and editing an existing record, update it
        await updatePaymentMethod(editingId!, newCardMethod);
      } else if (isEditMode) {
        // In edit mode but it's a new payment method, save temporarily
        if (editingId) {
          // Update existing temporary payment method
          setNewPaymentMethods(prev => 
            prev.map(m => m.id === editingId ? newCardMethod : m)
          );
        } else {
          // Add new temporary payment method
          setNewPaymentMethods(prev => [...prev, newCardMethod]);
        }
      } else {
        // Not in edit mode, save to database immediately
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
        id: editingId || generateTempId(),
        type: "bank",
        name: data.accountName,
        last4: data.accountNumber.slice(-4),
        bank_name: data.bankName,
        is_for_subscription: useForBoth && isOwner ? true : undefined,
        is_for_rent: isOwner ? true : undefined,
        is_for_payment: false,
      };
      
      if (isEditMode && !editingId?.startsWith('temp-')) {
        // If in edit mode and editing an existing record, update it
        await updatePaymentMethod(editingId!, bankMethod);
      } else if (isEditMode) {
        // In edit mode but it's a new payment method, save temporarily
        if (editingId) {
          // Update existing temporary payment method
          setNewPaymentMethods(prev => 
            prev.map(m => m.id === editingId ? bankMethod : m)
          );
        } else {
          // Add new temporary payment method
          setNewPaymentMethods(prev => [...prev, bankMethod]);
        }
      } else {
        // Not in edit mode, save to database immediately
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

  // Select bank account for rent payment - updates local state, doesn't save to DB yet
  const handleSelectRentBank = (id: string) => {
    const currentDefault = getDefaultRentMethod();
    const isChanged = currentDefault?.id !== id;
    
    setSelectedRentBankId(id);
    setHasSelectionChanged(isChanged || hasSelectionChanged);
    
    // If not in edit mode, save changes immediately
    if (!isEditMode) {
      setDefaultRentMethod(id)
        .then(() => {
          // Refresh payment methods after saving to update UI
          return fetchPaymentMethods();
        })
        .then(() => {
          // Show a temporary saved message
          toast.success("Payment method for rent updated");
          
          // Reset change tracking since we just saved
          setHasSelectionChanged(false);
        })
        .catch((error) => {
          console.error("Error setting default rent method:", error);
          toast.error("Failed to update rent payment method");
        });
    }
  };

  // Select payment method for subscription - updates local state, doesn't save to DB yet
  const handleSelectSubscription = (id: string) => {
    const currentDefault = getDefaultSubscriptionMethod();
    const isChanged = currentDefault?.id !== id;
    
    setSelectedSubscriptionId(id);
    setHasSelectionChanged(isChanged || hasSelectionChanged);
    
    // If not in edit mode, save changes immediately
    if (!isEditMode) {
      setDefaultSubscriptionMethod(id)
        .then(() => {
          // Refresh payment methods after saving to update UI
          return fetchPaymentMethods();
        })
        .then(() => {
          // Show a temporary saved message
          toast.success("Payment method for subscription updated");
          
          // Reset change tracking since we just saved
          setHasSelectionChanged(false);
        })
        .catch((error) => {
          console.error("Error setting default subscription method:", error);
          toast.error("Failed to update subscription payment method");
        });
    }
  };

  // Save new payment methods added during edit mode
  const saveNewPaymentMethods = async () => {
    console.log("Saving new payment methods to Supabase:", newPaymentMethods);
    
    if (newPaymentMethods.length === 0) {
      return true; // Nothing to save
    }
    
    try {
      // Filter out temporary IDs before saving to database
      const methodsToSave = newPaymentMethods.map(method => {
        const { id, ...methodWithoutId } = method;
        return methodWithoutId;
      });
      
      // Process each method individually
      for (const method of methodsToSave) {
        await addPaymentMethod(method);
      }
      
      // Clear the temporary list
      setNewPaymentMethods([]);
      
      // Refresh the payment methods list
      await fetchPaymentMethods();
      
      return true;
    } catch (error) {
      console.error("Error saving new payment methods:", error);
      toast.error("Failed to save payment methods");
      return false;
    }
  };

  // Save changes to selected payment methods when exiting edit mode
  const savePaymentMethodSelections = async () => {
    console.log("Saving payment method selections to Supabase...");
    console.log("Selected subscription ID:", selectedSubscriptionId);
    console.log("Selected rent bank ID:", selectedRentBankId);
    
    try {
      let updatePromises = [];
      
      if (selectedSubscriptionId) {
        updatePromises.push(setDefaultSubscriptionMethod(selectedSubscriptionId));
      }
      
      if (selectedRentBankId) {
        updatePromises.push(setDefaultRentMethod(selectedRentBankId));
      }
      
      await Promise.all(updatePromises);
      
      // Save new payment methods if there are any
      await saveNewPaymentMethods();
      
      // Update the UI to reflect changes by refreshing payment methods
      await fetchPaymentMethods();
      
      // Reset the change tracking flag
      setHasSelectionChanged(false);
      
      return true;
    } catch (error) {
      console.error("Error saving payment method selections:", error);
      toast.error("Failed to save payment preferences");
      return false;
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

  // Combine database payment methods with temporary ones for display
  const allPaymentMethods = [...paymentMethods, ...newPaymentMethods];
  
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Payment Methods Section */}
          <div>
            <PaymentMethodsList 
              methods={allPaymentMethods} 
              onEdit={handleEdit} 
              onAddCard={isEditMode ? handleAddCardClick : undefined} 
              onAddBank={isEditMode ? handleAddBankClick : undefined}
              isEditMode={isEditMode}
              isOwner={isOwner}
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
                  isEditing={!!editingId && !editingId.startsWith('temp-')}
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
                  isEditing={!!editingId && !editingId.startsWith('temp-')}
                  isOwner={isOwner}
                />
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Pay for Subscription Section - Show only for owner users */}
          {isOwner && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium mb-4">Pay for Subscription</h3>
              <p className="text-gray-600 mb-4">
                Select payment method for subscription
              </p>
              
              {allPaymentMethods.length > 0 ? 
                <PaymentMethodSelect 
                  methods={allPaymentMethods} 
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
              
              {isEditMode && hasSelectionChanged && 
                <p className="text-sm text-amber-600 mt-2">
                  Click "Save" to apply your changes
                </p>
              }
            </div>
          )}
          
          {/* Receive Rent Payment Section - Show only for owner users */}
          {isOwner && (
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
              
              {isEditMode && hasSelectionChanged && 
                <p className="text-sm text-amber-600 mt-2">
                  Click "Save" to apply your changes
                </p>
              }
            </div>
          )}
          
          {/* Family user payment methods indicator */}
          {!isOwner && isEditMode && newPaymentMethods.length > 0 && (
            <div className="border-t border-gray-200 pt-4 mt-2">
              <p className="text-sm text-amber-600">
                Click "Save" to add your new payment methods
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Export the component with forwardRef
export const PaymentMethodManager = forwardRef(PaymentMethodManagerComponent);
