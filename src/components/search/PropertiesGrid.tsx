
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  amenities: string[];
  rating: number;
  reviews: number;
}

interface PropertiesGridProps {
  properties: Property[];
  loading: boolean;
  onReset: () => void;
}

const PropertiesGrid = ({ properties, loading, onReset }: PropertiesGridProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex rounded-full bg-primary-100 p-4">
          <Home size={24} className="text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No care homes found</h3>
        <p className="mt-2 text-gray-600">
          Try adjusting your search filters or exploring a different location
        </p>
        <Button className="mt-6" onClick={onReset}>
          Reset All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map(property => (
        <Card key={property.id} className="overflow-hidden care-card">
          <div className="h-48 w-full relative">
            <img 
              src={property.image} 
              alt={property.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <Badge className="bg-white text-care-700">
                ★ {property.rating} ({property.reviews})
              </Badge>
            </div>
          </div>
          
          <CardContent className="pt-6">
            <h3 className="font-bold text-xl mb-1">{property.name}</h3>
            <p className="text-gray-600 mb-4">{property.location}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {property.amenities.slice(0, 3).map(amenity => (
                <span key={amenity} className="amenity-badge">
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="amenity-badge">+{property.amenities.length - 3} more</span>
              )}
            </div>
            <p className="font-semibold text-lg">
              ${property.price.toLocaleString()}/month
            </p>
          </CardContent>
          
          <CardFooter className="border-t pt-4">
            <Button 
              onClick={() => navigate(`/property/${property.id}`)} 
              className="w-full"
            >
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PropertiesGrid;
