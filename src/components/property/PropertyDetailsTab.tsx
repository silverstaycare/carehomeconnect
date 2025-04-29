import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "lucide-react";
import { useState } from "react";
import EditPropertyForm from "./EditPropertyForm";
import { PropertyMediaUpload } from "@/components/PropertyMediaUpload";

interface PropertyDetailsTabProps {
  description: string;
  price: number;
  capacity: number;
  active: boolean;
  owner: {
    name: string;
    phone: string;
    email: string;
  };
  userRole?: string;
  isOwner?: boolean;
  propertyId: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  onPropertyUpdated?: (updatedProperty: Partial<any>) => void;
  onMediaUpdated?: (urls: { photos: string[], video: string | null }) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

const PropertyDetailsTab = ({
  description,
  price,
  capacity,
  active,
  owner,
  userRole,
  isOwner = false,
  propertyId,
  address = "",
  city = "",
  state = "",
  zip_code = "",
  onPropertyUpdated,
  onMediaUpdated,
  isEditing,
  setIsEditing
}: PropertyDetailsTabProps) => {

  const handleSave = (updatedProperty: any) => {
    setIsEditing(false);
    if (onPropertyUpdated) {
      onPropertyUpdated(updatedProperty);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const handleMediaUploadComplete = (urls: { photos: string[], video: string | null }) => {
    if (onMediaUpdated) {
      onMediaUpdated(urls);
    }
  };

  if (isEditing && isOwner) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Edit Property Details</h2>
          <EditPropertyForm 
            property={{
              id: propertyId,
              name: "",  // This will be filled by the parent component
              description,
              location: `${address}, ${city}, ${state} ${zip_code}`,
              price,
              capacity,
              address,
              city,
              state,
              zip_code
            }}
            onSave={handleSave}
            onCancel={handleCancel}
          />
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Property Media</h3>
            <PropertyMediaUpload 
              onUploadComplete={handleMediaUploadComplete} 
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Property Information</h2>
            </div>
            <p className="text-gray-700 mb-6">
              {description}
            </p>
            
            <h3 className="text-lg font-semibold mb-3">Care Home Details</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex justify-between">
                <span className="text-gray-600">Monthly Price:</span>
                <span className="font-medium">${price.toLocaleString()}/month</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-medium">{capacity} residents</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">Senior Group Home</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${active ? 'text-green-600' : 'text-red-600'}`}>
                  {active ? 'Active' : 'Inactive'}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <ul className="space-y-4">
              <li>
                <p className="font-medium">{owner.name}</p>
                <p className="text-gray-600">Care Home Owner</p>
              </li>
              <Separator />
              <li>
                <p className="font-medium">{owner.phone}</p>
                <p className="text-gray-600">Phone</p>
              </li>
              <li>
                <p className="font-medium">{owner.email}</p>
                <p className="text-gray-600">Email</p>
              </li>
            </ul>
            {userRole === "family" && active && (
              <Button className="w-full mt-6">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule a Visit
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyDetailsTab;
