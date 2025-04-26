
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden care-card">
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
            <span className="amenity-badge">
              +{property.amenities.length - 3} more
            </span>
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
  );
};

export default PropertyCard;
