
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Banknote, Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useBankDetails, BankFormValues } from "@/hooks/useBankDetails";
import { BankDetailsForm } from "@/components/payment/BankDetailsForm";
import { BankDetailsDisplay } from "@/components/payment/BankDetailsDisplay";

interface BankDetailsSectionProps {
  user: any;
}

export function BankDetailsSection({ user }: BankDetailsSectionProps) {
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const { 
    bankDetails, 
    isProcessing, 
    useForBoth, 
    setUseForBoth, 
    saveBankDetails 
  } = useBankDetails(user?.id);

  // Handle bank form submission
  const onSubmitBank = async (data: BankFormValues) => {
    const success = await saveBankDetails(data);
    if (success) {
      setIsAddBankOpen(false);
    }
    return success;
  };

  // Check if we should show the bank details section
  // Only show if there are bank details and they're not marked for both purposes
  const shouldShowBankSection = !bankDetails?.use_for_both || !bankDetails;

  // Prepare default values for the form when editing
  const getFormDefaultValues = (): BankFormValues => {
    if (bankDetails) {
      return {
        accountName: bankDetails.account_name || "",
        accountNumber: bankDetails.account_number || "",
        routingNumber: bankDetails.routing_number || "",
        bankName: bankDetails.bank_name || ""
      };
    }
    return {
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      bankName: ""
    };
  };

  if (!shouldShowBankSection) {
    return (
      <div>
        <h3 className="text-xl font-medium mb-3 border-b pb-2">Receive Payment Methods</h3>
        <p className="text-gray-600 mb-4">Same bank account is being used for both payments and deposits</p>
        
        <BankDetailsDisplay 
          bankDetails={bankDetails} 
          onEdit={() => setIsAddBankOpen(true)}
          isForBothPayments={true}
        />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-medium mb-3 border-b pb-2">Receive Payment Methods</h3>
      <p className="text-gray-600 mb-4">Add your bank details to receive payments from bookings</p>
      
      {bankDetails ? (
        <BankDetailsDisplay 
          bankDetails={bankDetails} 
          onEdit={() => setIsAddBankOpen(true)}
        />
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center mb-4">
          <p className="text-gray-600">No bank details added yet</p>
        </div>
      )}
      
      {!bankDetails && (
        <Button
          variant="outline"
          onClick={() => setIsAddBankOpen(true)}
          className="mt-4 w-full md:w-auto"
        >
          <Banknote className="mr-2 h-4 w-4" />
          Add Bank Details
        </Button>
      )}

      {/* Add Bank Details Dialog */}
      <Dialog open={isAddBankOpen} onOpenChange={setIsAddBankOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{bankDetails ? "Edit Bank Details" : "Add Bank Details"}</DialogTitle>
          </DialogHeader>
          
          <BankDetailsForm
            defaultValues={getFormDefaultValues()}
            onSubmit={onSubmitBank}
            isProcessing={isProcessing}
            useForBoth={useForBoth}
            onUseForBothChange={setUseForBoth}
            onCancel={() => setIsAddBankOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
