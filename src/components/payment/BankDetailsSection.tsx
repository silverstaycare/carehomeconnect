
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { Banknote, Plus, ShieldCheck } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";

const bankSchema = z.object({
  accountName: z.string().min(2, { message: "Account name is required" }),
  accountNumber: z.string().min(5, { message: "Valid account number required" }),
  routingNumber: z.string().min(9, { message: "Valid routing number required" }).max(9),
  bankName: z.string().min(2, { message: "Bank name is required" }),
});

type BankFormValues = z.infer<typeof bankSchema>;

interface BankDetailsSectionProps {
  user: any;
}

export function BankDetailsSection({ user }: BankDetailsSectionProps) {
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [isProcessingBank, setIsProcessingBank] = useState(false);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [useForBoth, setUseForBoth] = useState(false);
  const { toast } = useToast();
  
  const bankForm = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      bankName: ""
    }
  });

  // Fetch bank details with improved error handling
  const fetchBankDetails = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("bank_details")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching bank details:", error);
        toast({
          title: "Error loading data",
          description: "Could not load your bank information. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setBankDetails(data);
        setUseForBoth(data.use_for_both || false);
        
        // Pre-fill the form if we're editing
        bankForm.reset({
          accountName: data.account_name || "",
          accountNumber: data.account_number || "",
          routingNumber: data.routing_number || "",
          bankName: data.bank_name || ""
        });
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
      toast({
        title: "Error loading data",
        description: "Could not load your bank information. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Load bank details when component mounts
  useEffect(() => {
    fetchBankDetails();
  }, [user]);

  // Handle bank form submission with improved security
  const onSubmitBank = async (data: BankFormValues) => {
    if (!user) return;
    
    setIsProcessingBank(true);
    
    try {
      // Check if bank details already exist
      const { data: existingData, error: checkError } = await supabase
        .from("bank_details")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError; 
      }
      
      // Setup payload with the useForBoth flag
      const bankPayload = {
        account_name: data.accountName,
        account_number: data.accountNumber,
        routing_number: data.routingNumber,
        bank_name: data.bankName,
        use_for_both: useForBoth
      };
      
      let updateError;
      
      if (existingData?.id) {
        // Update existing record
        const { error } = await supabase
          .from("bank_details")
          .update(bankPayload)
          .eq("user_id", user.id);
          
        updateError = error;
      } else {
        // Create new record
        const { error } = await supabase
          .from("bank_details")
          .insert({
            user_id: user.id,
            ...bankPayload
          });
          
        updateError = error;
      }
      
      if (updateError) throw updateError;
      
      toast({
        title: "Banking details updated",
        description: "Your banking information has been saved securely",
        icon: <ShieldCheck className="h-4 w-4 text-green-600" />
      });
      
      // Refresh bank details
      fetchBankDetails();
      
      // Close the dialog
      setIsAddBankOpen(false);
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast({
        title: "Error",
        description: "Failed to update banking information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingBank(false);
    }
  };

  // Check if we should show the bank details section
  // Only show if there are bank details and they're not marked for both purposes
  const shouldShowBankSection = !bankDetails?.use_for_both || !bankDetails;

  if (!shouldShowBankSection) {
    return (
      <div>
        <h3 className="text-xl font-medium mb-3 border-b pb-2">Receive Payment Methods</h3>
        <p className="text-gray-600 mb-4">Same bank account is being used for both payments and deposits</p>
        
        <div className="border rounded-md p-4">
          <div className="flex items-center">
            <div className="bg-green-50 p-2 rounded mr-4">
              <Banknote className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{bankDetails.bank_name}</p>
              <p className="text-sm text-gray-500">
                {bankDetails.account_name} • Account ending in {bankDetails.account_number?.slice(-4)}
              </p>
              <div className="mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block">
                Used for both subscription and rent deposits
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAddBankOpen(true)}
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-medium mb-3 border-b pb-2">Receive Payment Methods</h3>
      <p className="text-gray-600 mb-4">Add your bank details to receive payments from bookings</p>
      
      {bankDetails ? (
        <div className="border rounded-md p-4">
          <div className="flex items-center">
            <div className="bg-green-50 p-2 rounded mr-4">
              <Banknote className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{bankDetails.bank_name}</p>
              <p className="text-sm text-gray-500">
                {bankDetails.account_name} • Account ending in {bankDetails.account_number?.slice(-4)}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAddBankOpen(true)}
            >
              Edit
            </Button>
          </div>
        </div>
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
          
          <Form {...bankForm}>
            <form onSubmit={bankForm.handleSubmit(onSubmitBank)} className="space-y-4">
              <FormField
                control={bankForm.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Holder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter account holder name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={bankForm.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bank name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={bankForm.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter account number" 
                          type="password" 
                          autoComplete="off"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bankForm.control}
                  name="routingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routing Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="9 digits" 
                          maxLength={9}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <Checkbox 
                  id="useForBoth" 
                  checked={useForBoth} 
                  onCheckedChange={(checked) => {
                    setUseForBoth(checked as boolean);
                  }}
                />
                <label
                  htmlFor="useForBoth"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Use this account for both subscription payments and rent deposits
                </label>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm text-blue-700 mb-4 flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>Your banking information is stored securely with encryption and is only accessible by you.</p>
              </div>
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddBankOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isProcessingBank}>
                  {isProcessingBank ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    bankDetails ? "Update Bank Details" : "Save Bank Details"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
