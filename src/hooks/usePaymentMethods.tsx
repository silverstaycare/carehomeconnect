
import { useState, useEffect, useCallback } from 'react';
import { paymentService, PaymentMethod } from '@/services/paymentService';

export function usePaymentMethods(userId: string | undefined) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const methods = await paymentService.fetchPaymentMethods(userId);
      setPaymentMethods(methods);
    } catch (err) {
      console.error("Error in usePaymentMethods:", err);
      setError("Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  // Add a new payment method
  const addPaymentMethod = useCallback(async (method: PaymentMethod) => {
    if (!userId) return null;
    
    const result = await paymentService.addPaymentMethod(userId, method);
    if (result) {
      await fetchPaymentMethods();
    }
    return result;
  }, [userId, fetchPaymentMethods]);
  
  // Update a payment method
  const updatePaymentMethod = useCallback(async (id: string, updates: Partial<PaymentMethod>) => {
    const result = await paymentService.updatePaymentMethod(id, updates);
    if (result) {
      await fetchPaymentMethods();
    }
    return result;
  }, [fetchPaymentMethods]);
  
  // Delete a payment method
  const deletePaymentMethod = useCallback(async (id: string) => {
    const success = await paymentService.deletePaymentMethod(id);
    if (success) {
      await fetchPaymentMethods();
    }
    return success;
  }, [fetchPaymentMethods]);
  
  // Set default methods - ensure to refresh payment methods afterward
  const setDefaultSubscriptionMethod = useCallback(async (id: string) => {
    const success = await paymentService.setDefaultSubscriptionMethod(id);
    return success;
  }, []);
  
  const setDefaultRentMethod = useCallback(async (id: string) => {
    const success = await paymentService.setDefaultRentMethod(id);
    return success;
  }, []);
  
  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchPaymentMethods();
    }
  }, [userId, fetchPaymentMethods]);
  
  // Find methods based on type and default status
  const getCardMethods = useCallback(() => {
    return paymentMethods.filter(method => method.type === 'card');
  }, [paymentMethods]);
  
  const getBankMethods = useCallback(() => {
    return paymentMethods.filter(method => method.type === 'bank');
  }, [paymentMethods]);
  
  // Use subscription default as primary default
  const getDefaultMethod = useCallback(() => {
    return paymentMethods.find(method => method.is_for_subscription === true);
  }, [paymentMethods]);
  
  const getDefaultSubscriptionMethod = useCallback(() => {
    return paymentMethods.find(method => method.is_for_subscription === true);
  }, [paymentMethods]);
  
  const getDefaultRentMethod = useCallback(() => {
    return paymentMethods.find(method => method.is_for_rent === true);
  }, [paymentMethods]);
  
  return {
    paymentMethods,
    isLoading,
    error,
    fetchPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultSubscriptionMethod,
    setDefaultRentMethod,
    getCardMethods,
    getBankMethods,
    getDefaultMethod,
    getDefaultSubscriptionMethod,
    getDefaultRentMethod
  };
}
