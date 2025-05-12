
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PaymentMethod {
  id?: string;
  type: "card" | "bank";
  name: string;
  last4?: string;
  bank_name?: string;
  exp_month?: number;
  exp_year?: number;
  is_for_subscription?: boolean;
  is_for_rent?: boolean;
  user_id?: string;
  is_for_payment?: boolean;
}

export const paymentService = {
  // Fetch all payment methods for a user
  async fetchPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      console.log("Fetching payment methods for user:", userId);
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("Payment methods fetched:", data);
      
      // Cast the returned data to ensure type compatibility
      return (data || []).map(item => ({
        ...item,
        type: item.type as "card" | "bank" // Ensure type is correctly cast to our union type
      }));
      
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Failed to load payment methods");
      return [];
    }
  },
  
  // Add a new payment method
  async addPaymentMethod(userId: string, paymentMethod: PaymentMethod): Promise<PaymentMethod | null> {
    try {
      console.log("Adding new payment method for user:", userId, paymentMethod);
      
      // If no payment methods exist yet, make this one default
      const { count } = await supabase
        .from('payment_methods')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      const isFirstMethod = count === 0;
      
      const { data, error } = await supabase
        .from('payment_methods')
        .insert([
          { 
            ...paymentMethod,
            user_id: userId,
            is_for_subscription: paymentMethod.is_for_subscription || isFirstMethod,
            is_for_rent: paymentMethod.type === 'bank' ? (paymentMethod.is_for_rent || isFirstMethod) : false,
            is_for_payment: paymentMethod.type === 'card' ? 
              (paymentMethod.is_for_payment !== undefined ? paymentMethod.is_for_payment : true) : 
              false
          }
        ])
        .select('*')
        .single();
      
      if (error) throw error;
      
      console.log("Payment method added successfully:", data);
      toast.success(`${paymentMethod.type === 'card' ? 'Card' : 'Bank account'} added successfully`);
      
      // Cast the returned data to ensure type compatibility
      return {
        ...data,
        type: data.type as "card" | "bank" // Ensure type is correctly cast to our union type
      };
      
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast.error(`Failed to add ${paymentMethod.type === 'card' ? 'card' : 'bank account'}`);
      return null;
    }
  },
  
  // Update an existing payment method
  async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | null> {
    try {
      console.log("Updating payment method:", id, updates);
      
      const { data, error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      console.log("Payment method updated successfully:", data);
      toast.success("Payment method updated");
      
      // Cast the returned data to ensure type compatibility
      return {
        ...data,
        type: data.type as "card" | "bank" // Ensure type is correctly cast to our union type
      };
      
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast.error("Failed to update payment method");
      return null;
    }
  },
  
  // Delete a payment method
  async deletePaymentMethod(id: string): Promise<boolean> {
    try {
      console.log("Deleting payment method:", id);
      
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log("Payment method deleted successfully");
      toast.success("Payment method removed");
      return true;
      
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast.error("Failed to delete payment method");
      return false;
    }
  },
  
  // Set a payment method as default for subscription payments
  async setDefaultSubscriptionMethod(id: string): Promise<boolean> {
    try {
      console.log("Setting default subscription method:", id);
      
      // First reset all existing defaults
      const { error: resetError } = await supabase
        .from('payment_methods')
        .update({ is_for_subscription: false })
        .neq('id', id); // Using neq for more reliable behavior
      
      if (resetError) throw resetError;
      
      // Then set the selected one as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_for_subscription: true })
        .eq('id', id);
      
      if (error) throw error;
      
      console.log("Default subscription payment method updated successfully");
      return true;
      
    } catch (error) {
      console.error("Error setting default subscription method:", error);
      toast.error("Failed to update default payment method");
      return false;
    }
  },
  
  // Set a payment method as default for rent payments (banks only)
  async setDefaultRentMethod(id: string): Promise<boolean> {
    try {
      console.log("Setting default rent method:", id);
      
      // First reset all existing defaults
      const { error: resetError } = await supabase
        .from('payment_methods')
        .update({ is_for_rent: false })
        .neq('id', id); // Using neq for more reliable behavior
      
      if (resetError) throw resetError;
      
      // Then set the selected one as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_for_rent: true })
        .eq('id', id);
      
      if (error) throw error;
      
      console.log("Default rent payment method updated successfully");
      return true;
      
    } catch (error) {
      console.error("Error setting default rent method:", error);
      toast.error("Failed to update default rent payment method");
      return false;
    }
  }
};
