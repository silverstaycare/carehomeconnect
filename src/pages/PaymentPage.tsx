
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, Calendar, ChevronsUpDown } from 'lucide-react';

interface PropertyDetails {
  id: string;
  name: string;
  monthlyRate: number;
  owner: string;
}

const PaymentPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Property details state
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(true);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock property data - in a real app this would come from an API
        setProperty({
          id: propertyId || '1',
          name: 'Sunshine Senior Care',
          monthlyRate: 2800,
          owner: 'John Owner'
        });
      } catch (error) {
        console.error('Error fetching property details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load property details',
          variant: 'destructive'
        });
      } finally {
        setLoadingProperty(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId, toast]);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const val = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = val.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const val = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (val.length > 2) {
      return val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    return val;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form fields
      if (!cardName) throw new Error('Please enter the name on card');
      if (cardNumber.replace(/\s+/g, '').length < 16) throw new Error('Please enter a valid card number');
      if (expiry.length < 5) throw new Error('Please enter a valid expiry date');
      if (cvc.length < 3) throw new Error('Please enter a valid CVC');

      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show success toast
      toast({
        title: 'Payment Successful',
        description: `Your payment of $${property?.monthlyRate} to ${property?.name} has been processed.`,
      });

      // Redirect back to dashboard
      navigate('/family/dashboard');
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while processing your payment');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingProperty) {
    return (
      <div className="container py-12 px-4 flex justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-6">
            The property you're trying to pay for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/search")}>
            Browse Care Homes
          </Button>
        </div>
      </div>
    );
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
        {/* Payment Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Property:</span>
                <span className="font-medium">{property.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Owner:</span>
                <span className="font-medium">{property.owner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Type:</span>
                <span className="font-medium">Monthly Rent</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold text-xl">${property.monthlyRate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Card */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Enter your payment details to complete this transaction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <RadioGroup 
                value={paymentMethod} 
                onValueChange={setPaymentMethod}
                className="mb-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label htmlFor="credit-card" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Credit / Debit Card
                  </Label>
                </div>
              </RadioGroup>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      required
                    />
                    <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <div className="relative">
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        required
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={3}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/family/dashboard")}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>Pay ${property.monthlyRate}</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
