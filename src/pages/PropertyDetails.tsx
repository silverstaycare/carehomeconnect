
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, Heart, Calendar, MapPin } from "lucide-react";

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
}

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Mock API call to get property details
    const fetchProperty = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockProperty: Property = {
          id: id || "1",
          name: "Sunshine Senior Care",
          description: "Sunshine Senior Care is a warm and welcoming senior group home nestled in a quiet residential neighborhood. Our home provides personalized care in a comfortable setting, with beautiful gardens, spacious common areas, and a team of dedicated caregivers committed to enhancing the quality of life for each resident.",
          location: "123 Care St, San Francisco, CA 94123",
          price: 2800,
          image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
          amenities: [
            "Private Rooms", 
            "Ensuite Bathrooms", 
            "Beautiful Garden", 
            "Communal Dining", 
            "Entertainment Area",
            "Housekeeping",
            "Laundry Service",
            "Transportation"
          ],
          capacity: 8,
          careServices: [
            "24/7 Staff",
            "Medication Management",
            "Personal Care Assistance",
            "Mobility Assistance",
            "Meal Preparation",
            "Memory Care",
            "Social Activities"
          ],
          owner: {
            name: "John Owner",
            phone: "(555) 123-4567",
            email: "john@sunshinecare.com"
          },
          reviews: [
            {
              id: "r1",
              author: "Sarah Johnson",
              date: "2023-02-15",
              rating: 5,
              comment: "My mother has been living at Sunshine Senior Care for six months now, and I couldn't be happier with the care she receives. The staff is attentive and kind, and the home is always clean and welcoming."
            },
            {
              id: "r2",
              author: "Michael Thompson",
              date: "2023-01-20",
              rating: 4,
              comment: "A wonderful place with caring staff. My father enjoys the social activities and the garden. Only giving 4 stars because the parking can be limited during visiting hours."
            }
          ]
        };
        
        setProperty(mockProperty);
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
  }, [id, toast]);

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
          <div className="flex items-center gap-2 mb-4">
            <Badge className="text-sm">
              ★ {calculateAverageRating().toFixed(1)} ({property.reviews.length} reviews)
            </Badge>
            <Badge variant="outline" className="text-sm">
              Capacity: {property.capacity} residents
            </Badge>
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
          
          {user?.role === "owner" && user?.email === "owner@example.com" && (
            <Button 
              variant="outline"
              onClick={() => navigate(`/property/${property.id}/edit`)}
            >
              Edit Property
            </Button>
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
                      <span className="font-medium">${property.price}/month</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{property.capacity} residents</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">Senior Group Home</span>
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
                  {user?.role === "family" && (
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
    </div>
  );
};

export default PropertyDetails;
