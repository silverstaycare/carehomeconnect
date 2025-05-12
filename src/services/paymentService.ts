
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
  is_default?: boolean;
  is_subscription_default?: boolean;
  is_rent_default?: boolean;
  user_id?: string;
}

export const paymentService = {
  // Fetch all payment methods for a user
  async fetchPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
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
            is_default: paymentMethod.is_default || isFirstMethod,
            is_subscription_default: paymentMethod.is_subscription_default || isFirstMethod,
            is_rent_default: paymentMethod.type === 'bank' ? (paymentMethod.is_rent_default || isFirstMethod) : false
          }
        ])
        .select('*')
        .single();
      
      if (error) throw error;
      
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
      const { data, error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) throw error;
      
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
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
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
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_subscription_default: true })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Default subscription payment method updated");
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
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_rent_default: true })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Default rent payment method updated");
      return true;
      
    } catch (error) {
      console.error("Error setting default rent method:", error);
      toast.error("Failed to update default rent payment method");
      return false;
    }
  },
  
  // Set a payment method as the overall default
  async setDefaultMethod(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Default payment method updated");
      return true;
      
    } catch (error) {
      console.error("Error setting default method:", error);
      toast.error("Failed to update default payment method");
      return false;
    }
  }
};
