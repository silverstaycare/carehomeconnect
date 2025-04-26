
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Home, DollarSign, Calendar } from "lucide-react";

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  occupancy: {
    current: number;
    total: number;
  };
  activeDate: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  date: string;
  property: string;
  from: string;
}

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);

  useEffect(() => {
    // Mock data loading - in a real app, this would fetch from an API
    setProperties([
      {
        id: "1",
        name: "Sunshine Senior Care",
        location: "San Francisco, CA",
        price: 2800,
        image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
        occupancy: {
          current: 6,
          total: 8
        },
        activeDate: "2023-03-15"
      }
    ]);

    setRecentPayments([
      {
        id: "p1",
        amount: 2800,
        status: "successful",
        date: "2023-04-01",
        property: "Sunshine Senior Care",
        from: "John Smith"
      },
      {
        id: "p2",
        amount: 2800,
        status: "successful",
        date: "2023-03-01",
        property: "Sunshine Senior Care",
        from: "John Smith"
      }
    ]);
  }, []);

  // Function to redirect to subscription page
  const handleSubscription = () => {
    navigate("/owner/subscription");
  };

  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Owner Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate("/owner/list-property")}>
            <Home className="mr-2 h-4 w-4" />
            List New Property
          </Button>
          <Button variant="outline" onClick={handleSubscription}>
            <DollarSign className="mr-2 h-4 w-4" />
            Manage Subscription
          </Button>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-muted/40 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">No Properties Listed Yet</h2>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            Get started by listing your first property on Care Home Connect.
          </p>
          <Button onClick={() => navigate("/owner/list-property")}>
            List Your First Property
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="properties">
          <TabsList className="mb-8">
            <TabsTrigger value="properties">My Properties</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
          </TabsList>
          
          {/* Properties Tab */}
          <TabsContent value="properties">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(property => (
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
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Monthly Price:</span>
                      <span className="font-medium">${property.price}/month</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Occupancy:</span>
                      <span className="font-medium">
                        {property.occupancy.current}/{property.occupancy.total} rooms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Listed Since:</span>
                      <span className="font-medium">
                        {new Date(property.activeDate).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button variant="outline" onClick={() => navigate(`/property/${property.id}`)}>
                      View Details
                    </Button>
                    <Button variant="secondary" onClick={() => navigate(`/property/${property.id}/edit`)}>
                      Edit
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>
                  View your recent payment history from residents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recentPayments.map(payment => (
                    <div key={payment.id} className="flex justify-between items-center border-b pb-4">
                      <div>
                        <p className="font-medium text-lg">${payment.amount}</p>
                        <p className="text-gray-600 text-sm">
                          From: {payment.from} • {payment.property}
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
                  View All Transactions
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default OwnerDashboard;
