
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, Heart, Calendar, MapPin, Trash2 } from "lucide-react";
import DeactivatePropertyDialog from "@/components/property/DeactivatePropertyDialog";
import { supabase } from "@/integrations/supabase/client";

interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  price: number;
  image: string;
  amenities: string[];
  capacity: number;
  careServices: string[];
  active: boolean;
  owner: {
    name: string;
    phone: string;
    email: string;
  };
  reviews: {
    id: string;
    author: string;
    date: string;
    rating: number;
    comment: string;
  }[];
  ownerId: string;
}

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    // Fetch property details
    const fetchProperty = async () => {
      try {
        if (!id) {
          toast({
            title: "Error",
            description: "Property ID is missing",
            variant: "destructive"
          });
          navigate("/search");
          return;
        }
        
        setLoading(true);
        
        // Get property details from supabase
        const { data: homeData, error: homeError } = await supabase
          .from('care_homes')
          .select('*')
          .eq('id', id)
          .single();
          
        if (homeError) {
          throw homeError;
        }
        
        if (!homeData) {
          toast({
            title: "Property Not Found",
            description: "The property you're looking for doesn't exist",
            variant: "destructive"
          });
          navigate("/search");
          return;
        }
        
        // Get amenities
        const { data: amenitiesData } = await supabase
          .from('care_home_amenities')
          .select('*')
          .eq('care_home_id', id)
          .single();
        
        // Get services
        const { data: servicesData } = await supabase
          .from('care_home_services')
          .select('*')
          .eq('care_home_id', id)
          .single();
        
        // Get media
        const { data: mediaData } = await supabase
          .from('care_home_media')
          .select('*')
          .eq('care_home_id', id);

        // Format amenities as string array
        const amenitiesList: string[] = [];
        if (amenitiesData) {
          if (amenitiesData.private_rooms) amenitiesList.push('Private Rooms');
          if (amenitiesData.ensuite_rooms) amenitiesList.push('Ensuite Bathrooms');
          if (amenitiesData.garden) amenitiesList.push('Beautiful Garden');
          if (amenitiesData.communal_dining) amenitiesList.push('Communal Dining');
          if (amenitiesData.entertainment_area) amenitiesList.push('Entertainment Area');
          if (amenitiesData.housekeeping) amenitiesList.push('Housekeeping');
          if (amenitiesData.laundry) amenitiesList.push('Laundry Service');
          if (amenitiesData.transportation) amenitiesList.push('Transportation');
        }
        
        // Format services as string array
        const servicesList: string[] = [];
        if (servicesData) {
          if (servicesData.twenty_four_hour_staff) servicesList.push('24/7 Staff');
          if (servicesData.medication_management) servicesList.push('Medication Management');
          if (servicesData.personal_care) servicesList.push('Personal Care Assistance');
          if (servicesData.mobility_assistance) servicesList.push('Mobility Assistance');
          if (servicesData.meal_preparation) servicesList.push('Meal Preparation');
          if (servicesData.memory_care) servicesList.push('Memory Care');
          if (servicesData.social_activities) servicesList.push('Social Activities');
        }
        
        // Find primary image
        let primaryImage = "https://images.unsplash.com/photo-1568605114967-8130f3a36994";
        if (mediaData && mediaData.length > 0) {
          const primaryMedia = mediaData.find(m => m.is_primary);
          if (primaryMedia && primaryMedia.photo_url) {
            primaryImage = primaryMedia.photo_url;
          } else if (mediaData[0].photo_url) {
            primaryImage = mediaData[0].photo_url;
          }
        }
        
        // Get owner info from profiles table
        const { data: ownerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', homeData.owner_id)
          .single();
        
        // Construct owner info, ensuring we have all necessary fields
        const ownerInfo = {
          name: ownerData?.first_name && ownerData?.last_name 
            ? `${ownerData.first_name} ${ownerData.last_name}` 
            : "Care Home Owner",
          phone: ownerData?.phone || "(555) 123-4567",
          // Use user_metadata email as fallback if not available in profiles
          email: ownerData?.email || "contact@carehomeconnect.com"
        };

        // Get reviews (mock data for now)
        const reviews = [
          {
            id: "r1",
            author: "Sarah Johnson",
            date: "2023-02-15",
            rating: 5,
            comment: "My mother has been living at this care home for six months now, and I couldn't be happier with the care she receives. The staff is attentive and kind, and the home is always clean and welcoming."
          },
          {
            id: "r2",
            author: "Michael Thompson",
            date: "2023-01-20",
            rating: 4,
            comment: "A wonderful place with caring staff. My father enjoys the social activities. Only giving 4 stars because the parking can be limited during visiting hours."
          }
        ];

        // Construct the property object with active status
        const propertyData: Property = {
          id: homeData.id,
          name: homeData.name,
          description: homeData.description,
          location: `${homeData.address}, ${homeData.city}, ${homeData.state} ${homeData.zip_code}`,
          price: homeData.price,
          image: primaryImage,
          amenities: amenitiesList,
          capacity: homeData.capacity,
          careServices: servicesList,
          active: homeData.active !== false, // If null or undefined, treat as active
          owner: ownerInfo,
          reviews,
          ownerId: homeData.owner_id
        };

        setProperty(propertyData);
        
        // Check if current user is the owner of this property
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setIsOwner(currentUser?.id === homeData.owner_id);
        
      } catch (error) {
        console.error("Error fetching property:", error);
        toast({
          title: "Error",
          description: "Failed to load property details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate, toast]);

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

  const handleDeactivateProperty = () => {
    setIsDeactivateDialogOpen(true);
  };

  const handlePropertyDeactivated = () => {
    if (property) {
      setProperty({
        ...property,
        active: false
      });
      
      toast({
        title: "Property Deactivated",
        description: "This property has been deactivated and is no longer visible to families"
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-12 px-4 flex justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-6">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/search")}>
            Browse Care Homes
          </Button>
        </div>
      </div>
    );
  }

  const calculateAverageRating = () => {
    if (!property.reviews.length) return 0;
    const sum = property.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / property.reviews.length;
  };

  return (
    <div className="container py-8 px-4">
      {/* Property Header */}
      <div className="md:flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{property.location}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className="text-sm">
              ★ {calculateAverageRating().toFixed(1)} ({property.reviews.length} reviews)
            </Badge>
            <Badge variant="outline" className="text-sm">
              Capacity: {property.capacity} residents
            </Badge>
            {!property.active && (
              <Badge variant="destructive" className="text-sm">
                Inactive
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          {user?.role === "family" && (
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

      {/* Property Images */}
      <div className="mb-8">
        <div className="rounded-lg overflow-hidden h-80">
          <img 
            src={property.image} 
            alt={property.name} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Property Tabs */}
      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="amenities">Amenities & Services</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">About This Care Home</h2>
                  <p className="text-gray-700 mb-6">
                    {property.description}
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-3">Care Home Details</h3>
                  <ul className="space-y-2 mb-6">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Monthly Price:</span>
                      <span className="font-medium">${property.price.toLocaleString()}/month</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{property.capacity} residents</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">Senior Group Home</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${property.active ? 'text-green-600' : 'text-red-600'}`}>
                        {property.active ? 'Active' : 'Inactive'}
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
                      <p className="font-medium">{property.owner.name}</p>
                      <p className="text-gray-600">Care Home Owner</p>
                    </li>
                    <Separator />
                    <li>
                      <p className="font-medium">{property.owner.phone}</p>
                      <p className="text-gray-600">Phone</p>
                    </li>
                    <li>
                      <p className="font-medium">{property.owner.email}</p>
                      <p className="text-gray-600">Email</p>
                    </li>
                  </ul>
                  {user?.role === "family" && property.active && (
                    <Button className="w-full mt-6">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule a Visit
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Amenities Tab */}
        <TabsContent value="amenities">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.amenities.map((amenity, index) => (
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
                  {property.careServices.map((service, index) => (
                    <div key={index} className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-care-600 mr-2"></div>
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">
                Reviews ({property.reviews.length})
              </h2>
              
              {property.reviews.length === 0 ? (
                <p className="text-gray-600">This property has no reviews yet.</p>
              ) : (
                <div className="space-y-8">
                  {property.reviews.map(review => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex justify-between mb-2">
                        <p className="font-medium">{review.author}</p>
                        <p className="text-gray-500 text-sm">
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <span 
                            key={i} 
                            className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Owner Actions */}
      {isOwner && (
        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Owner Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            {property.active && (
              <Button 
                variant="destructive" 
                onClick={handleDeactivateProperty}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Deactivate Home
              </Button>
            )}
            {!property.active && (
              <p className="text-gray-600">
                This property has been deactivated and is no longer visible to families.
              </p>
            )}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Note: Once added, properties cannot be deleted from the system, only deactivated.
          </p>
        </div>
      )}

      {/* Deactivate dialog */}
      {property && (
        <DeactivatePropertyDialog
          propertyId={property.id}
          propertyName={property.name}
          isOpen={isDeactivateDialogOpen}
          onClose={() => setIsDeactivateDialogOpen(false)}
          onDeactivate={handlePropertyDeactivated}
        />
      )}
    </div>
  );
};

export default PropertyDetails;
