
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PropertyDetailsTab from "./PropertyDetailsTab";
import AmenitiesServicesTab from "./AmenitiesServicesTab";
import ReviewsTab from "./ReviewsTab";
import InquiriesTab from "./InquiriesTab";
import PropertyEditButton from "./PropertyEditButton";
import { Property } from "@/hooks/usePropertyDetails";
import { useState, useEffect } from "react";
import { BellAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PropertyTabsProps {
  property: Property;
  isOwner: boolean;
  isEditing: boolean;
  isAuthenticated: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onPropertyUpdated: (updatedProperty: Partial<Property>) => void;
  onMediaUpdated: (urls: { photos: string[], video: string | null }) => void;
  onAmenitiesServicesUpdated: (updatedData: { amenities?: string[], careServices?: string[] }) => void;
  setIsEditing: (isEditing: boolean) => void;
  userRole?: string;
  user?: any;
}

const PropertyTabs = ({
  property,
  isOwner,
  isEditing,
  isAuthenticated,
  onEdit,
  onSave,
  onCancel,
  onPropertyUpdated,
  onMediaUpdated,
  onAmenitiesServicesUpdated,
  setIsEditing,
  userRole,
  user
}: PropertyTabsProps) => {
  const [hasNewInquiries, setHasNewInquiries] = useState(false);

  useEffect(() => {
    if (isOwner) {
      const fetchPendingInquiries = async () => {
        try {
          const { count, error } = await supabase
            .from('inquiries')
            .select('*', { count: 'exact', head: true })
            .eq('care_home_id', property.id)
            .eq('status', 'pending');
            
          if (error) {
            console.error("Error fetching inquiries:", error);
            return;
          }
          
          setHasNewInquiries(count !== null && count > 0);
        } catch (error) {
          console.error("Error checking for new inquiries:", error);
        }
      };
      
      fetchPendingInquiries();
    }
  }, [isOwner, property.id]);

  return (
    <Tabs defaultValue="details" className="w-full">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          {isOwner && (
            <TabsTrigger value="inquiries" className="flex items-center">
              Inquiries
              {hasNewInquiries && (
                <BellAlert className="ml-1 h-4 w-4 text-amber-500" />
              )}
            </TabsTrigger>
          )}
        </TabsList>
        
        {/* Edit Button aligned with tabs */}
        <PropertyEditButton 
          isOwner={isOwner}
          isEditing={isEditing}
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
        />
      </div>
      
      {/* Combined Details Tab */}
      <TabsContent value="details">
        <div className="space-y-8">
          <PropertyDetailsTab
            description={property.description}
            price={property.price}
            capacity={property.capacity}
            active={property.active}
            owner={property.owner}
            userRole={userRole}
            isOwner={isOwner}
            propertyId={property.id}
            propertyName={property.name}
            address={property.address}
            city={property.city}
            state={property.state}
            zip_code={property.zip_code}
            onPropertyUpdated={onPropertyUpdated}
            onMediaUpdated={onMediaUpdated}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isAuthenticated={isAuthenticated}
            user={user}
          />
          
          <AmenitiesServicesTab
            amenities={property.amenities}
            careServices={property.careServices}
            isOwner={isOwner}
            propertyId={property.id}
            onUpdate={onAmenitiesServicesUpdated}
            isEditing={isEditing}
          />
        </div>
      </TabsContent>
      
      {/* Reviews Tab */}
      <TabsContent value="reviews">
        <ReviewsTab 
          reviews={property.reviews}
          isOwner={isOwner}
          propertyOwnerId={property.ownerId}
        />
      </TabsContent>
      
      {/* Inquiries Tab - Only shown to property owners */}
      <TabsContent value="inquiries">
        <InquiriesTab
          propertyId={property.id}
          isOwner={isOwner}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PropertyTabs;
