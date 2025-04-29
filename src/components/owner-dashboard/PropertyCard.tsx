
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Property } from "@/hooks/useOwnerProperties";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  // Format price for display
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(property.price || 0);
  
  const handleCardClick = () => {
    navigate(`/property/${property.id}`);
  };

  return (
    <Card 
      className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardContent className="p-0 flex flex-col h-full">
        <div className="relative">
          <img 
            src={property.image || "/placeholder.svg"} 
            alt={property.name}
            className="h-48 w-full object-cover rounded-t-lg"
          />
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-care-500">{formattedPrice}</Badge>
          </div>
          
          {!property.active && (
            <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center rounded-t-lg">
              <Badge variant="outline" className="bg-black/75 text-white border-white">
                Inactive
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{property.name}</h3>
          <p className="text-muted-foreground text-sm mb-2 line-clamp-1">
            {property.city}, {property.state}
          </p>
          
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">Capacity:</span>
              <span className="text-sm">{property.capacity || 0}</span>
            </div>
            
            <Link 
              to={`/property/${property.id}`}
              className="text-care-600 hover:text-care-700 text-sm font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              View
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
