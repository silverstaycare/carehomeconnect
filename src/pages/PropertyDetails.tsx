
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { usePropertyDetails } from "@/hooks/usePropertyDetails";

// Import extracted components
import PropertyHeader from "@/components/property/PropertyHeader";
import PropertyImage from "@/components/property/PropertyImage";
import PropertyTabs from "@/components/property/PropertyTabs";
import OwnerActions from "@/components/property/OwnerActions";
import PropertyLoading from "@/components/property/PropertyLoading";
import PropertyNotFound from "@/components/property/PropertyNotFound";

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const {
    property,
    loading,
    isOwner,
    isEditing,
    isAuthenticated,
    setIsEditing,
    handlePropertyDeactivated,
    handlePropertyUpdated,
    handleImageUpdated,
    handleMediaUpdated,
    handleAmenitiesServicesUpdated,
    user
  } = usePropertyDetails(id);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    toast({
      title: "Changes Saved",
      description: "All property details have been updated successfully"
    });
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    toast({
      description: "Edits cancelled"
    });
  };

  if (loading) {
    return <PropertyLoading />;
  }

  if (!property) {
    return <PropertyNotFound />;
  }

  return (
    <div className="container py-8 px-4">
      {/* Property Header */}
      <PropertyHeader
        id={property.id}
        name={property.name}
        location={property.location}
        active={property.active}
        reviews={property.reviews}
        capacity={property.capacity}
        userRole={user?.user_metadata?.role}
        price={property.price}
        image={property.image}
      />

      {/* Property Image */}
      <div className="mb-4">
        <PropertyImage 
          image={property.image} 
          name={property.name}
          isOwner={isOwner}
          propertyId={property.id}
          onImageUpdated={handleImageUpdated}
          isEditing={isEditing}
        />
      </div>
      
      {/* Property Tabs and Edit Button */}
      <div className="flex items-center justify-between mb-6">
        <PropertyTabs
          property={property}
          isOwner={isOwner}
          isEditing={isEditing}
          isAuthenticated={isAuthenticated}
          onEdit={handleEditClick}
          onSave={handleSaveClick}
          onCancel={handleCancelClick}
          onPropertyUpdated={handlePropertyUpdated}
          onMediaUpdated={handleMediaUpdated}
          onAmenitiesServicesUpdated={handleAmenitiesServicesUpdated}
          setIsEditing={setIsEditing}
          userRole={user?.user_metadata?.role}
        />
      </div>

      {/* Owner Actions */}
      {isOwner && (
        <OwnerActions
          propertyId={property.id}
          propertyName={property.name}
          active={property.active}
          onDeactivate={handlePropertyDeactivated}
        />
      )}
    </div>
  );
};

export default PropertyDetails;
