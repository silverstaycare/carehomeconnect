
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface PropertyCardProps {
  property: {
    id: string;
    name: string;
    location: string;
    price: number;
    description: string;
    capacity: number;
    city: string;
    state: string;
    active: boolean;
    image?: string;
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  const navigate = useNavigate();

  return (
    <Card key={property.id} className="overflow-hidden">
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          <img
            src={property.image}
            alt={property.name}
            className="object-cover w-full h-full"
          />
        </AspectRatio>
        {property.active === false && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Inactive
          </Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle>{property.name}</CardTitle>
        <CardDescription>
          {property.city}, {property.state}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>
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
  );
}
