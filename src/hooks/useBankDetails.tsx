
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BankDetails } from "@/types/bank";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck } from "lucide-react";

export interface BankFormValues {
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
}

export function useBankDetails(userId: string) {
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useForBoth, setUseForBoth] = useState(false);
  const { toast } = useToast();

  // Fetch bank details with improved error handling
  const fetchBankDetails = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from("bank_details")
        .select()
        .eq("user_id", userId)
        .maybeSingle<BankDetails>();

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

  // Save or update bank details
  const saveBankDetails = async (formData: BankFormValues) => {
    if (!userId) return false;
    
    setIsProcessing(true);
    
    try {
      // Check if bank details already exist
      const { data: existingData, error: checkError } = await supabase
        .from("bank_details")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle<BankDetails>();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError; 
      }
      
      // Setup payload with the useForBoth flag
      const bankPayload = {
        account_name: formData.accountName,
        account_number: formData.accountNumber,
        routing_number: formData.routingNumber,
        bank_name: formData.bankName,
        use_for_both: useForBoth
      };
      
      let updateError;
      
      if (existingData?.id) {
        // Update existing record
        const { error } = await supabase
          .from("bank_details")
          .update(bankPayload)
          .eq("user_id", userId);
          
        updateError = error;
      } else {
        // Create new record
        const { error } = await supabase
          .from("bank_details")
          .insert({
            user_id: userId,
            ...bankPayload
          });
          
        updateError = error;
      }
      
      if (updateError) throw updateError;
      
      // Use a string for icon instead of JSX element
      toast({
        title: "Banking details updated",
        description: "Your banking information has been saved securely",
        icon: <ShieldCheck className="h-4 w-4 text-green-600" />
      });
      
      // Refresh bank details
      fetchBankDetails();
      return true;
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast({
        title: "Error",
        description: "Failed to update banking information. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Load bank details when component mounts
  useEffect(() => {
    fetchBankDetails();
  }, [userId]);

  return {
    bankDetails,
    isProcessing,
    useForBoth,
    setUseForBoth,
    fetchBankDetails,
    saveBankDetails
  };
}
