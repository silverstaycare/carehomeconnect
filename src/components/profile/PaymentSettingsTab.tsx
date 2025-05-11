import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash, Banknote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

interface PaymentSettingsTabProps {
  user: any;
}

const cardSchema = z.object({
  cardholderName: z.string().min(2, "Cardholder name is required"),
  cardNumber: z.string()
    .min(13, "Card number must be between 13-19 digits")
    .max(19, "Card number must be between 13-19 digits")
    .refine((val) => /^[0-9]+$/.test(val), "Card number must contain only digits"),
  expiryDate: z.string()
    .min(5, "Expiry date is required (MM/YY)")
    .max(5, "Expiry date must be in MM/YY format")
    .refine((val) => /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(val), "Expiry date must be in MM/YY format"),
  cvc: z.string()
    .min(3, "CVC must be 3-4 digits")
    .max(4, "CVC must be 3-4 digits")
    .refine((val) => /^[0-9]+$/.test(val), "CVC must contain only digits"),
});

type CardFormValues = z.infer<typeof cardSchema>;

const bankSchema = z.object({
  accountName: z.string().min(2, { message: "Account name is required" }),
  accountNumber: z.string().min(5, { message: "Valid account number required" }),
  routingNumber: z.string().min(9, { message: "Valid routing number required" }).max(9),
  bankName: z.string().min(2, { message: "Bank name is required" }),
});

type BankFormValues = z.infer<typeof bankSchema>;

interface PaymentCard {
  id: string;
  cardholder_name: string;
  last_four: string;
  expiry_date: string;
  card_type: string;
  is_default: boolean;
}

export function PaymentSettingsTab({ user }: PaymentSettingsTabProps) {
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [isProcessingBank, setIsProcessingBank] = useState(false);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const cardForm = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvc: ""
    }
  });

  const bankForm = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      bankName: ""
    }
  });

  // Fetch saved payment cards
  const fetchPaymentCards = async () => {
    if (!user) return;
    
    try {
      setIsLoadingCards(true);
      
      // Here we would normally fetch cards from Stripe via an edge function
      // For now, we'll simulate with mock data
      const mockCards: PaymentCard[] = [
        {
          id: "card_1",
          cardholder_name: "John Smith",
          last_four: "4242",
          expiry_date: "12/25",
          card_type: "Visa",
          is_default: true
        }
      ];
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPaymentCards(mockCards);
    } catch (error) {
      console.error("Error fetching payment cards:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCards(false);
    }
  };

  // Load payment cards when component mounts
  useEffect(() => {
    fetchPaymentCards();
    fetchBankDetails();
  }, [user]);

  // Format card number with spaces
  const formatCardNumber = (value: string): string => {
    const val = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = val.match(/.{1,4}/g);
    return matches ? matches.join(' ') : value;
  };

  // Format expiry date with slash
  const formatExpiryDate = (value: string): string => {
    const val = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (val.length >= 2) {
      return `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    return val;
  };

  // Handle card form submission
  const onSubmitCard = async (data: CardFormValues) => {
    if (!user) return;
    
    setIsProcessingCard(true);
    
    try {
      // In a real implementation, we would call a Stripe edge function
      // to tokenize and save the card securely
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add new card to state (in real app, we'd fetch from API)
      const newCard: PaymentCard = {
        id: `card_${Date.now()}`,
        cardholder_name: data.cardholderName,
        last_four: data.cardNumber.slice(-4),
        expiry_date: data.expiryDate,
        card_type: getCardType(data.cardNumber),
        is_default: paymentCards.length === 0 // Make default if first card
      };
      
      setPaymentCards([...paymentCards, newCard]);
      
      toast({
        title: "Card added",
        description: "Your payment method has been saved"
      });
      
      // Reset form and close dialog
      cardForm.reset();
      setIsAddCardOpen(false);
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast({
        title: "Error",
        description: "Failed to save payment method",
        variant: "destructive",
      });
    } finally {
      setIsProcessingCard(false);
    }
  };

  // Determine card type from number
  const getCardType = (cardNumber: string): string => {
    const firstDigit = cardNumber.charAt(0);
    
    if (cardNumber.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(cardNumber)) return 'Mastercard';
    if (/^3[47]/.test(cardNumber)) return 'American Express';
    if (/^6(?:011|5)/.test(cardNumber)) return 'Discover';
    
    return 'Card';
  };

  // Remove payment card
  const handleRemoveCard = async (cardId: string) => {
    try {
      // In a real implementation, we would call a Stripe edge function
      // to remove the card securely
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove card from state
      setPaymentCards(paymentCards.filter(card => card.id !== cardId));
      
      toast({
        title: "Card removed",
        description: "Your payment method has been removed"
      });
    } catch (error) {
      console.error("Error removing payment method:", error);
      toast({
        title: "Error",
        description: "Failed to remove payment method",
        variant: "destructive",
      });
    }
  };

  // Set card as default
  const handleSetDefaultCard = async (cardId: string) => {
    try {
      // In a real implementation, we would call a Stripe edge function
      // to set the default card
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update cards in state
      setPaymentCards(paymentCards.map(card => ({
        ...card,
        is_default: card.id === cardId
      })));
      
      toast({
        title: "Default updated",
        description: "Your default payment method has been updated"
      });
    } catch (error) {
      console.error("Error setting default payment method:", error);
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      });
    }
  };

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
    }
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
      
      let updateError;
      
      if (existingData?.id) {
        // Update existing record
        const { error } = await (supabase
          .from("bank_details" as any)
          .update({
            account_name: data.accountName,
            account_number: data.accountNumber,
            routing_number: data.routingNumber,
            bank_name: data.bankName
          })
          .eq("user_id", user.id) as any);
          
        updateError = error;
      } else {
        // Create new record
        const { error } = await (supabase
          .from("bank_details" as any)
          .insert({
            user_id: user.id,
            account_name: data.accountName,
            account_number: data.accountNumber,
            routing_number: data.routingNumber,
            bank_name: data.bankName
          }) as any);
          
        updateError = error;
      }
      
      if (updateError) throw updateError;
      
      toast({
        title: "Banking details updated",
        description: "Your banking information has been saved securely"
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

  // Navigate to bank details tab in profile
  const handleAddBankDetails = () => {
    navigate('/profile', { state: { activeTab: 'bank' } });
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Payment Methods</h2>
      
      {isLoadingCards ? (
        <div className="flex items-center justify-center p-4">
          <Spinner size="sm" />
          <p className="ml-3 text-gray-600">Loading payment methods...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentCards.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
              <p className="text-gray-600">No payment methods added yet</p>
            </div>
          ) : (
            paymentCards.map((card) => (
              <div key={card.id} className="flex items-center justify-between border rounded-md p-4">
                <div className="flex items-center">
                  <div className="bg-blue-50 p-2 rounded mr-4">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {card.card_type} •••• {card.last_four}
                      {card.is_default && (
                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Default</Badge>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {card.cardholder_name} • Expires {card.expiry_date}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!card.is_default && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSetDefaultCard(card.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRemoveCard(card.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
          
          <div className="flex flex-col gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsAddCardOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setIsAddBankOpen(true)}
              className="bg-gray-50 hover:bg-gray-100"
            >
              <Banknote className="mr-2 h-4 w-4" />
              Add Bank Details
            </Button>
          </div>

          {bankDetails && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Bank Account Information</h3>
              <div className="border rounded-md p-4">
                <div className="flex items-center">
                  <div className="bg-green-50 p-2 rounded mr-4">
                    <Banknote className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{bankDetails.bank_name}</p>
                    <p className="text-sm text-gray-500">
                      {bankDetails.account_name} • Account ending in {bankDetails.account_number?.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Payment Method Dialog */}
      <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          
          <Form {...cardForm}>
            <form onSubmit={cardForm.handleSubmit(onSubmitCard)} className="space-y-4">
              <FormField
                control={cardForm.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name on card" {...field} />
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
                        value={formatCardNumber(field.value)}
                        onChange={(e) => {
                          const formatted = e.target.value.replace(/\s+/g, '').slice(0, 19);
                          field.onChange(formatted);
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
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                            field.onChange(formatExpiryDate(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={cardForm.control}
                  name="cvc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVC</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123" 
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
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
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddCardOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isProcessingCard}>
                  {isProcessingCard ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Card"
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
            <DialogTitle>Add Bank Details</DialogTitle>
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
              
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm text-blue-700 mb-4">
                <p>Your banking information is stored securely and will be used for receiving payments from bookings.</p>
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
                    "Save Bank Details"
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
