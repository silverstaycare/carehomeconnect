
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  description: string;
  capacity: number;
  city: string;
  state: string;
}

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Please log in",
            description: "You must be logged in to view your properties",
            variant: "destructive"
          });
          navigate("/login");
          return;
        }

        // Get properties with the current user's ID
        const { data, error } = await supabase
          .from('care_homes')
          .select('*')
          .eq('owner_id', user.id);

        if (error) {
          throw error;
        }

        console.log("Fetched properties:", data);

        // Transform the data to match the Property interface
        const transformedProperties: Property[] = data?.map(home => ({
          id: home.id,
          name: home.name,
          location: `${home.city}, ${home.state}`, // Create the location field
          price: home.price,
          description: home.description,
          capacity: home.capacity,
          city: home.city,
          state: home.state
        })) || [];

        setProperties(transformedProperties);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast({
          title: "Error",
          description: "Failed to fetch properties",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [navigate, toast]);

  // Redirect to list property page if no properties exist
  const handleListProperty = () => {
    navigate("/owner/list-property");
  };

  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no properties, show empty state
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/40 rounded-lg text-center">
        <Home className="h-16 w-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold mb-4">No Properties Listed Yet</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          List your first property on Care Home Connect to start connecting with potential residents and their families.
        </p>
        <Button size="lg" onClick={handleListProperty}>
          List Your First Property
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Owner Dashboard</h1>
          <p className="text-gray-600">Manage your care homes</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate("/owner/list-property")}>
            <Home className="mr-2 h-4 w-4" />
            List New Property
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{property.name}</CardTitle>
              <CardDescription>
                {property.city}, {property.state}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{property.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    Capacity: {property.capacity} residents
                  </Badge>
                  <span className="font-semibold text-primary">
                    ${property.price.toLocaleString()}/month
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/property/${property.id}`)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OwnerDashboard;
