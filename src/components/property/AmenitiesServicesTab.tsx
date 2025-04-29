
import { Card, CardContent } from "@/components/ui/card";

interface AmenitiesServicesTabProps {
  amenities: string[];
  careServices: string[];
}

const AmenitiesServicesTab = ({ amenities, careServices }: AmenitiesServicesTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Amenities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-care-600 mr-2"></div>
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Care Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {careServices.map((service, index) => (
              <div key={index} className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-care-600 mr-2"></div>
                <span>{service}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AmenitiesServicesTab;
