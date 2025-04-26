
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
    // Initialize with empty arrays instead of mock data
    setProperties([]);
    setRecentPayments([]);
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

      <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/40 rounded-lg text-center">
        <Home className="h-16 w-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold mb-4">No Properties Listed Yet</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          List your first property on Care Home Connect to start connecting with potential residents and their families.
        </p>
        <Button size="lg" onClick={() => navigate("/owner/list-property")}>
          List Your First Property
        </Button>
      </div>
    </div>
  );
};

export default OwnerDashboard;
