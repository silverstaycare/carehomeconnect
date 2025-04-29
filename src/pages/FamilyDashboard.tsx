
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, CreditCard, Search } from "lucide-react";

interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  location: string;
  image: string;
  startDate: string;
  monthlyPayment: number;
  nextPaymentDate: string;
  resident: string;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  property: string;
  status: string;
}

interface SavedProperty {
  id: string;
  name: string;
  location: string;
  price: number;
  image: string;
}

const FamilyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  
  // Get user's display name from metadata
  const getUserDisplayName = () => {
    if (!user) return '';
    
    // Check if user has metadata with first_name
    if (user.user_metadata && 
        (user.user_metadata.first_name || user.user_metadata.last_name)) {
      const firstName = user.user_metadata.first_name || '';
      const lastName = user.user_metadata.last_name || '';
      return `${firstName} ${lastName}`.trim();
    }
    
    // Fallback to email
    return user.email || 'User';
  };

  useEffect(() => {
    // Mock data loading - in a real app, this would fetch from an API
    setCurrentBookings([
      {
        id: "b1",
        propertyId: "1",
        propertyName: "Sunshine Senior Care",
        location: "San Francisco, CA",
        image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
        startDate: "2023-01-15",
        monthlyPayment: 2800,
        nextPaymentDate: "2023-05-01",
        resident: "Martha Johnson"
      }
    ]);

    setSavedProperties([
      {
        id: "2",
        name: "Golden Years Manor",
        location: "Los Angeles, CA",
        price: 3200,
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be"
      },
      {
        id: "3",
        name: "Serenity Care Home",
        location: "Seattle, WA",
        price: 2950,
        image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09"
      }
    ]);

    setRecentPayments([
      {
        id: "p1",
        amount: 2800,
        date: "2023-04-01",
        property: "Sunshine Senior Care",
        status: "successful"
      },
      {
        id: "p2",
        amount: 2800,
        date: "2023-03-01",
        property: "Sunshine Senior Care",
        status: "successful"
      }
    ]);
  }, []);

  const handleMakePayment = (propertyId: string) => {
    navigate(`/payment/${propertyId}`);
  };

  const removeSavedProperty = (id: string) => {
    setSavedProperties(savedProperties.filter(property => property.id !== id));
    toast({
      title: "Property removed",
      description: "The property has been removed from your saved list.",
    });
  };

  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Family Dashboard</h1>
          <p className="text-gray-600">Welcome back, {getUserDisplayName()}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => navigate("/search")}>
            <Search className="mr-2 h-4 w-4" />
            Find Care Homes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="current">
        <TabsList className="mb-8">
          <TabsTrigger value="current">Current Bookings</TabsTrigger>
          <TabsTrigger value="saved">Saved Properties</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>
        
        {/* Current Bookings Tab */}
        <TabsContent value="current">
          {currentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-muted/40 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">No Active Bookings</h2>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Find and book a care home for your loved one to get started.
              </p>
              <Button onClick={() => navigate("/search")}>
                Find Care Homes
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentBookings.map(booking => (
                <Card key={booking.id} className="overflow-hidden care-card">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      <img 
                        src={booking.image} 
                        alt={booking.propertyName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="md:w-2/3">
                      <CardHeader>
                        <CardTitle>{booking.propertyName}</CardTitle>
                        <CardDescription>{booking.location}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Resident:</span>
                            <span className="font-medium">{booking.resident}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Start Date:</span>
                            <span className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Payment:</span>
                            <span className="font-medium">${booking.monthlyPayment}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Next Payment:</span>
                            <span className="font-medium">{new Date(booking.nextPaymentDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          className="w-full sm:w-auto"
                          onClick={() => handleMakePayment(booking.propertyId)}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Make Payment
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => navigate(`/property/${booking.propertyId}`)}
                        >
                          View Property
                        </Button>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Saved Properties Tab */}
        <TabsContent value="saved">
          {savedProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-muted/40 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">No Saved Properties</h2>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Save properties you're interested in to compare and visit later.
              </p>
              <Button onClick={() => navigate("/search")}>
                Browse Care Homes
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map(property => (
                <Card key={property.id} className="care-card">
                  <div className="h-40 w-full relative">
                    <img 
                      src={property.image} 
                      alt={property.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{property.name}</CardTitle>
                    <CardDescription>{property.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="font-semibold text-lg">
                      ${property.price}/month
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3 border-t pt-4">
                    <Button 
                      className="w-full"
                      onClick={() => navigate(`/property/${property.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => removeSavedProperty(property.id)}
                    >
                      Remove from Saved
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View your payment history for all care home bookings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentPayments.map(payment => (
                  <div key={payment.id} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <p className="font-medium text-lg">${payment.amount}</p>
                      <p className="text-gray-600 text-sm">
                        {payment.property}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={payment.status === "successful" ? "default" : "destructive"}
                      className="capitalize"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Payments
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyDashboard;
