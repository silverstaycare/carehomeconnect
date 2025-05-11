
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Banknote } from "lucide-react";
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

const cardSchema = z.object({
  cardholderName: z.string().min(2, { message: "Name is required" }),
  cardNumber: z.string().min(13, { message: "Valid card number required" }).max(19),
  expiryDate: z.string().min(5, { message: "Valid expiry date required" }).max(5),
  cvv: z.string().min(3, { message: "Valid CVV required" }).max(4),
});

const bankSchema = z.object({
  accountName: z.string().min(2, { message: "Account name is required" }),
  accountNumber: z.string().min(5, { message: "Valid account number required" }),
  routingNumber: z.string().min(9, { message: "Valid routing number required" }).max(9),
  bankName: z.string().min(2, { message: "Bank name is required" }),
});

type CardFormValues = z.infer<typeof cardSchema>;
type BankFormValues = z.infer<typeof bankSchema>;

interface CardPaymentSectionProps {
  user: any;
}

export function CardPaymentSection({ user }: CardPaymentSectionProps) {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingBank, setIsProcessingBank] = useState(false);
  const [savedCards, setSavedCards] = useState<any[]>([
    // Placeholder data for UI display
    {
      id: 1,
      last4: "4242",
      brand: "Visa",
      exp_month: 12,
      exp_year: 2025,
    }
  ]);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [useForBoth, setUseForBoth] = useState(false);
  const { toast } = useToast();

  // Form for credit card
  const cardForm = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: ""
    }
  });

  // Form for bank account
  const bankForm = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      bankName: ""
    }
  });

  // Fetch bank details
  const fetchBankDetails = async () => {
    if (!user) return;
    
    try {
      // Using type assertion to access the bank_details table
      const { data, error } = await (supabase
        .from("bank_details" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle() as any);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setBankDetails(data);
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
    }
  };

  // Load bank details when component mounts
  useEffect(() => {
    fetchBankDetails();
  }, [user]);

  // Handle form submission
  const onSubmit = async (data: CardFormValues) => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Card added",
        description: "Your card has been added successfully",
      });
      
      setIsProcessing(false);
      setIsAddCardOpen(false);
      
      // Update the UI with the new card (in a real app, this would come from the API)
      setSavedCards([
        ...savedCards,
        {
          id: Math.floor(Math.random() * 1000),
          last4: data.cardNumber.slice(-4),
          brand: "Visa", // In a real app, this would be determined by the payment processor
          exp_month: parseInt(data.expiryDate.split('/')[0]),
          exp_year: parseInt(`20${data.expiryDate.split('/')[1]}`),
        }
      ]);
    }, 1500);
  };

  // Handle bank form submission
  const onSubmitBank = async (data: BankFormValues) => {
    if (!user) return;
    
    setIsProcessingBank(true);
    
    try {
      // Check if bank details already exist
      const { data: existingData, error: checkError } = await (supabase
        .from("bank_details" as any)
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle() as any);
        
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
        const { error } = await (supabase
          .from("bank_details" as any)
          .update(bankPayload)
          .eq("user_id", user.id) as any);
          
        updateError = error;
      } else {
        // Create new record
        const { error } = await (supabase
          .from("bank_details" as any)
          .insert({
            user_id: user.id,
            ...bankPayload
          }) as any);
          
        updateError = error;
      }
      
      if (updateError) throw updateError;
      
      toast({
        title: "Banking details updated",
        description: "Your banking information has been saved securely",
      });
      
      // Refresh bank details
      fetchBankDetails();
      
      // Close the dialog
      setIsAddBankOpen(false);
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast({
        title: "Error",
        description: "Failed to update banking information",
        variant: "destructive",
      });
    } finally {
      setIsProcessingBank(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-medium mb-3 border-b pb-2">Payment Methods</h3>
      <p className="text-gray-600 mb-4">Manage your payment methods for subscription</p>
      
      {savedCards.length > 0 && (
        <div className="space-y-3">
          {savedCards.map((card) => (
            <div key={card.id} className="border rounded-md p-4">
              <div className="flex items-center">
                <div className="bg-blue-50 p-2 rounded mr-4">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{card.brand} •••• {card.last4}</p>
                  <p className="text-sm text-gray-500">
                    Expires {card.exp_month}/{card.exp_year}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Default payment method",
                      description: "This card is your default payment method",
                    });
                  }}
                >
                  Default
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {bankDetails && (
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
              {bankDetails.use_for_both && (
                <div className="mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block">
                  Used for both subscription and rent deposits
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                toast({
                  title: "Bank Details",
                  description: "This bank account is set up for payments",
                });
              }}
            >
              Details
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap gap-3 mt-6">
        <Button
          variant="outline"
          onClick={() => setIsAddCardOpen(true)}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Add Card
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setIsAddBankOpen(true)}
        >
          <Banknote className="mr-2 h-4 w-4" />
          Add Bank Details
        </Button>
      </div>

      {/* Add Card Dialog */}
      <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Card</DialogTitle>
          </DialogHeader>
          
          <Form {...cardForm}>
            <form onSubmit={cardForm.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={cardForm.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter cardholder name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={cardForm.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="1234 5678 9012 3456" 
                        {...field} 
                        onChange={(e) => {
                          // Format card number with spaces
                          let value = e.target.value.replace(/\s/g, "");
                          if (value.length > 16) value = value.slice(0, 16);
                          value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={cardForm.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="MM/YY" 
                          {...field} 
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");
                            if (value.length > 4) value = value.slice(0, 4);
                            if (value.length > 2) {
                              value = `${value.slice(0, 2)}/${value.slice(2)}`;
                            }
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={cardForm.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123" 
                          type="password" 
                          {...field} 
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");
                            if (value.length > 4) value = value.slice(0, 4);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAddCardOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Card"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
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
              
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm text-blue-700 mb-4">
                <p>Your banking information is stored securely and will be used for subscription payments.</p>
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
