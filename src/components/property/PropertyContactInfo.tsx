
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import ContactTourDialog from "./ContactTourDialog";

interface PropertyContactInfoProps {
  owner: {
    name: string;
    phone: string;
    email: string;
  };
  userRole?: string;
  active: boolean;
  propertyId: string;
  propertyName: string;
  userData: {
    name: string;
    email: string;
  };
}

const PropertyContactInfo = ({
  owner,
  userRole,
  active,
  propertyId,
  propertyName,
  userData
}: PropertyContactInfoProps) => {
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  return (
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
          <Button 
            className="w-full mt-6"
            onClick={() => setContactDialogOpen(true)}
          >
            Inquiry
          </Button>
        )}
          
        {/* Contact Dialog */}
        <ContactTourDialog
          open={contactDialogOpen}
          onOpenChange={setContactDialogOpen}
          propertyId={propertyId}
          propertyName={propertyName}
          userData={userData}
        />
      </CardContent>
    </Card>
  );
};

export default PropertyContactInfo;
