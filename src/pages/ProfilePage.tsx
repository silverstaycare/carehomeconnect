
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wallet, CreditCard, Banknote } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters",
  }),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

const bankDetailsSchema = z.object({
  accountName: z.string().min(2, { message: "Account name is required" }),
  accountNumber: z.string().min(5, { message: "Valid account number required" }),
  routingNumber: z.string().min(9, { message: "Valid routing number required" }).max(9),
  bankName: z.string().min(2, { message: "Bank name is required" }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type BankDetailsFormValues = z.infer<typeof bankDetailsSchema>;

// Define the bank details type to match what's in the database
type BankDetails = {
  id?: string;
  user_id?: string;
  account_name: string | null;
  account_number: string | null;
  routing_number: string | null;
  bank_name: string | null;
  created_at?: string;
  updated_at?: string;
};

export default function ProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingBank, setIsSubmittingBank] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    role: string | null;
  } | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      phone: "",
      email: user?.email || "",
    },
  });

  const bankForm = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      bankName: "",
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    async function fetchProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data);
      
      // Set form values
      const displayName = [data?.first_name, data?.last_name].filter(Boolean).join(' ') || "";
      
      form.reset({
        displayName,
        phone: data?.phone || "",
        email: user?.email || "",
      });
    }

    async function fetchBankDetails() {
      // Type assertion to allow using the bank_details table even though it's not in the types yet
      const { data, error } = await (supabase
        .from("bank_details" as any)
        .select("*")
        .eq("user_id", user.id)
        .single() as any);

      if (!error && data) {
        setBankDetails(data as BankDetails);
        
        bankForm.reset({
          accountName: data.account_name || "",
          accountNumber: data.account_number || "",
          routingNumber: data.routing_number || "",
          bankName: data.bank_name || "",
        });
      }
    }

    fetchProfile();
    // Only fetch bank details for owners
    if (profile?.role === "owner") {
      fetchBankDetails();
    }
  }, [user, navigate, form, bankForm, profile?.role]);

  // Check subscription status when needed
  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      setIsCheckingSubscription(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  // Check subscription when tab changes to payment
  useEffect(() => {
    if (activeTab === "payment") {
      checkSubscriptionStatus();
    }
  }, [activeTab]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Split display name into first name and last name
      const nameParts = data.displayName.trim().split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name,
          last_name,
          phone: data.phone || null
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmitBankDetails(data: BankDetailsFormValues) {
    if (!user) return;
    
    setIsSubmittingBank(true);
    
    try {
      // Check if bank details already exist - using type assertion for the bank_details table
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
        // Update existing record - using type assertion for the bank_details table
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
        // Create new record - using type assertion for the bank_details table
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
        description: "Your banking information has been saved securely",
      });
      
      // Refresh bank details
      const { data: refreshedData } = await (supabase
        .from("bank_details" as any)
        .select("*")
        .eq("user_id", user.id)
        .single() as any);
        
      setBankDetails(refreshedData as BankDetails);
      
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast({
        title: "Error",
        description: "Failed to update banking information",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingBank(false);
    }
  }

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error accessing customer portal:", error);
      toast({
        title: "Error",
        description: "Failed to access subscription management portal",
        variant: "destructive",
      });
    }
  };

  const handleNavigateToSubscriptions = () => {
    navigate("/owner/subscription");
  };

  const userInitials = [
    profile?.first_name?.charAt(0) || "",
    profile?.last_name?.charAt(0) || "",
  ].join('').toUpperCase();

  // Only show bank details tab for owners
  const isOwner = profile?.role === "owner";

  return (
    <div className="container py-8 px-4 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-gray-600">Manage your account and subscription</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Payment Settings</span>
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger value="bank" className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              <span>Bank Details</span>
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="profile" className="pt-4">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16 text-xl">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-medium text-lg">
                  {[profile?.first_name, profile?.last_name].filter(Boolean).join(' ')}
                </h2>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Login)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Email address" 
                          {...field} 
                          disabled 
                          className="bg-muted cursor-not-allowed" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </TabsContent>
        
        <TabsContent value="payment" className="pt-4">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Subscription Management</h2>
            
            {isCheckingSubscription ? (
              <div className="flex items-center justify-center p-8">
                <Spinner size="lg" />
                <p className="ml-3 text-gray-600">Checking subscription status...</p>
              </div>
            ) : subscription?.subscribed ? (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="font-medium text-green-800">Active Subscription</h3>
                  <p className="text-green-700">
                    You have an active {subscription.subscription_tier || "Silver Stay"} subscription.
                    {subscription.subscription_end && (
                      <span> Next billing date: {new Date(subscription.subscription_end).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>
                
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    onClick={checkSubscriptionStatus}
                    size="sm"
                  >
                    Refresh Status
                  </Button>
                  
                  <Button onClick={handleManageSubscription}>
                    Manage Subscription
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border border-amber-200 bg-amber-50 rounded-md p-4">
                  <h3 className="font-medium text-amber-800">No Active Subscription</h3>
                  <p className="text-amber-700">
                    You don't have an active subscription. Subscribe to list your properties.
                  </p>
                </div>
                
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    onClick={checkSubscriptionStatus}
                    size="sm"
                  >
                    Refresh Status
                  </Button>
                  
                  <Button onClick={handleNavigateToSubscriptions}>
                    View Subscription Plans
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {isOwner && (
          <TabsContent value="bank" className="pt-4">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Banking Information</h2>
              <p className="text-gray-600 mb-6">
                Add your bank details to receive payments for your properties
              </p>
              
              <Form {...bankForm}>
                <form onSubmit={bankForm.handleSubmit(onSubmitBankDetails)} className="space-y-6">
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
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmittingBank}
                    >
                      {isSubmittingBank ? "Saving..." : "Save Bank Details"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
