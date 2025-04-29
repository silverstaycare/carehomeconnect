
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Heart, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PropertyHeaderProps {
  id: string;
  name: string;
  location: string;
  active: boolean;
  reviews: { rating: number }[];
  capacity: number;
  userRole?: string;
}

const PropertyHeader = ({ 
  id, 
  name, 
  location, 
  active, 
  reviews, 
  capacity,
  userRole 
}: PropertyHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);

  const calculateAverageRating = () => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const handlePayment = () => {
    navigate(`/payment/${id}`);
  };

  const toggleSave = () => {
    setSaved(!saved);
    toast({
      title: saved ? "Property removed" : "Property saved",
      description: saved 
        ? "The property has been removed from your saved list" 
        : "The property has been added to your saved list"
    });
  };

  return (
    <div className="md:flex items-start justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{name}</h1>
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{location}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge className="text-sm">
            ★ {calculateAverageRating().toFixed(1)} ({reviews.length} reviews)
          </Badge>
          <Badge variant="outline" className="text-sm">
            Capacity: {capacity} residents
          </Badge>
          {!active && (
            <Badge variant="destructive" className="text-sm">
              Inactive
            </Badge>
          )}
        </div>
      </div>
      
      <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
        {userRole === "family" && (
          <>
            <Button 
              onClick={handlePayment}
              className="bg-care-600 hover:bg-care-700"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Make Payment
            </Button>
            <Button 
              variant={saved ? "default" : "outline"} 
              onClick={toggleSave}
            >
              <Heart className={`mr-2 h-4 w-4 ${saved ? 'fill-current' : ''}`} />
              {saved ? "Saved" : "Save Property"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyHeader;
