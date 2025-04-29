
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PropertyDetailsTab from "./PropertyDetailsTab";
import AmenitiesServicesTab from "./AmenitiesServicesTab";
import ReviewsTab from "./ReviewsTab";
import InquiriesTab from "./InquiriesTab";
import PropertyEditButton from "./PropertyEditButton";
import { Property } from "@/hooks/usePropertyDetails";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("details");

  // Check for pending inquiries on component mount and when new inquiries arrive
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
      
      // Set up a real-time subscription to listen for new inquiries
      const channel = supabase
        .channel('inquiry-notifications')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'inquiries',
          filter: `care_home_id=eq.${property.id}`
        }, () => {
          // When a new inquiry is inserted, update the hasNewInquiries state
          setHasNewInquiries(true);
        })
        .subscribe();
        
      // Clean up the subscription when the component unmounts
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOwner, property.id]);

  // Hide bell icon when inquiries tab is active
  const shouldShowBell = hasNewInquiries && activeTab !== "inquiries";

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // If switching to the inquiries tab and there are new inquiries,
    // they will be marked as viewed by the InquiriesTab component
  };

  return (
    <Tabs defaultValue="details" className="w-full" onValueChange={handleTabChange}>
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          {isOwner && (
            <TabsTrigger value="inquiries" className="flex items-center">
              Inquiries
              {shouldShowBell && (
                <Bell className="ml-1 h-4 w-4 text-amber-500" />
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
          activeTab={activeTab}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PropertyTabs;
