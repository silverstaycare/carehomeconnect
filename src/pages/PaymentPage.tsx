
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/payment/LoadingSpinner';
import PropertyNotFound from '@/components/payment/PropertyNotFound';
import PaymentSummary from '@/components/payment/PaymentSummary';
import PaymentForm from '@/components/payment/PaymentForm';
import { toast } from "sonner";

interface PropertyDetails {
  id: string;
  name: string;
  monthlyRate: number;
  owner: string;
}

const PaymentPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(true);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProperty({
          id: propertyId || '1',
          name: 'Sunshine Senior Care',
          monthlyRate: 2800,
          owner: 'John Owner'
        });
      } catch (error) {
        console.error('Error fetching property details:', error);
      } finally {
        setLoadingProperty(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!cardName) throw new Error('Please enter the name on card');
      if (cardNumber.replace(/\s+/g, '').length < 16) throw new Error('Please enter a valid card number');
      if (expiry.length < 5) throw new Error('Please enter a valid expiry date');
      if (cvc.length < 3) throw new Error('Please enter a valid CVC');

      // Here, we would normally redirect to Stripe checkout
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Payment successful", {
        description: "Your payment has been processed successfully."
      });
      
      navigate('/family/dashboard');
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while processing your payment');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingProperty) {
    return <LoadingSpinner message="Loading payment details..." />;
  }

  if (!property) {
    return <PropertyNotFound />;
  }

  return (
    <div className="container py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment</h1>
        <p className="text-gray-600">
          Complete your payment for {property.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <PaymentSummary 
          monthlyRate={property?.monthlyRate || 0}
        />

        <PaymentForm
          isLoading={isLoading}
          error={error}
          cardName={cardName}
          setCardName={setCardName}
          cardNumber={cardNumber}
          setCardNumber={setCardNumber}
          expiry={expiry}
          setExpiry={setExpiry}
          cvc={cvc}
          setCvc={setCvc}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          onCancel={() => navigate("/family/dashboard")}
          onSubmit={handleSubmit}
          monthlyRate={property.monthlyRate}
        />
      </div>
    </div>
  );
};

export default PaymentPage;
