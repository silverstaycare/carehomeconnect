import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { PropertyMediaUpload } from "@/components/PropertyMediaUpload";

const ListProperty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    description: "",
    capacity: "",
    price: "",
  });

  // Amenities state
  const [amenities, setAmenities] = useState({
    privateRooms: false,
    ensuiteRooms: false,
    garden: false,
    communalDining: false,
    entertainmentArea: false,
    housekeeping: false,
    laundry: false,
    transportation: false,
  });

  // Care services state
  const [careServices, setCareServices] = useState({
    twentyFourHourStaff: false,
    medicationManagement: false,
    personalCare: false,
    mobilityAssistance: false,
    mealPreparation: false,
    memoryCare: false,
    socialActivities: false,
  });

  const [mediaUrls, setMediaUrls] = useState<{ photos: string[], video: string | null }>({
    photos: [],
    video: null
  });

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle amenity checkbox changes
  const handleAmenityChange = (amenity: keyof typeof amenities, checked: boolean) => {
    setAmenities(prev => ({ ...prev, [amenity]: checked }));
  };

  // Handle care service checkbox changes
  const handleCareServiceChange = (service: keyof typeof careServices, checked: boolean) => {
    setCareServices(prev => ({ ...prev, [service]: checked }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = ["name", "address", "city", "state", "zipCode", "description", "capacity", "price"];
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          throw new Error(`Please provide the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        }
      }

      // In a real app, this would be an API call to save the property data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Property Listed Successfully",
        description: "Your care home has been added to our platform.",
      });
      
      // Redirect to owner dashboard
      navigate("/owner/dashboard");
    } catch (error) {
      console.error("Error submitting property:", error);
      setError(error instanceof Error ? error.message : "An error occurred while listing your property");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">List Your Care Home</h1>
        <p className="text-gray-600">
          Provide details about your care home to connect with families looking for quality care.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide the essential details about your care home.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Care Home Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Sunshine Senior Care"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                name="address"
                placeholder="e.g., 123 Care Street"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="e.g., San Francisco"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="e.g., CA"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  placeholder="e.g., 94123"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your care home, its environment, and what makes it special..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Resident Capacity *</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  placeholder="e.g., 8"
                  value={formData.capacity}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Monthly Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  placeholder="e.g., 2800"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <CardDescription>
              Select the amenities available at your care home.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="privateRooms" 
                  checked={amenities.privateRooms}
                  onCheckedChange={(checked) => handleAmenityChange("privateRooms", !!checked)}
                />
                <Label htmlFor="privateRooms">Private Rooms</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ensuiteRooms" 
                  checked={amenities.ensuiteRooms}
                  onCheckedChange={(checked) => handleAmenityChange("ensuiteRooms", !!checked)}
                />
                <Label htmlFor="ensuiteRooms">Ensuite Bathrooms</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="garden" 
                  checked={amenities.garden}
                  onCheckedChange={(checked) => handleAmenityChange("garden", !!checked)}
                />
                <Label htmlFor="garden">Beautiful Garden</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="communalDining" 
                  checked={amenities.communalDining}
                  onCheckedChange={(checked) => handleAmenityChange("communalDining", !!checked)}
                />
                <Label htmlFor="communalDining">Communal Dining</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="entertainmentArea" 
                  checked={amenities.entertainmentArea}
                  onCheckedChange={(checked) => handleAmenityChange("entertainmentArea", !!checked)}
                />
                <Label htmlFor="entertainmentArea">Entertainment Area</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="housekeeping" 
                  checked={amenities.housekeeping}
                  onCheckedChange={(checked) => handleAmenityChange("housekeeping", !!checked)}
                />
                <Label htmlFor="housekeeping">Housekeeping</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="laundry" 
                  checked={amenities.laundry}
                  onCheckedChange={(checked) => handleAmenityChange("laundry", !!checked)}
                />
                <Label htmlFor="laundry">Laundry Service</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="transportation" 
                  checked={amenities.transportation}
                  onCheckedChange={(checked) => handleAmenityChange("transportation", !!checked)}
                />
                <Label htmlFor="transportation">Transportation</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Care Services */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Care Services</CardTitle>
            <CardDescription>
              Select the care services you provide to residents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="twentyFourHourStaff" 
                  checked={careServices.twentyFourHourStaff}
                  onCheckedChange={(checked) => handleCareServiceChange("twentyFourHourStaff", !!checked)}
                />
                <Label htmlFor="twentyFourHourStaff">24/7 Staff</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="medicationManagement" 
                  checked={careServices.medicationManagement}
                  onCheckedChange={(checked) => handleCareServiceChange("medicationManagement", !!checked)}
                />
                <Label htmlFor="medicationManagement">Medication Management</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="personalCare" 
                  checked={careServices.personalCare}
                  onCheckedChange={(checked) => handleCareServiceChange("personalCare", !!checked)}
                />
                <Label htmlFor="personalCare">Personal Care Assistance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mobilityAssistance" 
                  checked={careServices.mobilityAssistance}
                  onCheckedChange={(checked) => handleCareServiceChange("mobilityAssistance", !!checked)}
                />
                <Label htmlFor="mobilityAssistance">Mobility Assistance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mealPreparation" 
                  checked={careServices.mealPreparation}
                  onCheckedChange={(checked) => handleCareServiceChange("mealPreparation", !!checked)}
                />
                <Label htmlFor="mealPreparation">Meal Preparation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="memoryCare" 
                  checked={careServices.memoryCare}
                  onCheckedChange={(checked) => handleCareServiceChange("memoryCare", !!checked)}
                />
                <Label htmlFor="memoryCare">Memory Care</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="socialActivities" 
                  checked={careServices.socialActivities}
                  onCheckedChange={(checked) => handleCareServiceChange("socialActivities", !!checked)}
                />
                <Label htmlFor="socialActivities">Social Activities</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Upload */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Property Media</CardTitle>
            <CardDescription>
              Add photos and a video of your care home to help families get a better view.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PropertyMediaUpload
              onUploadComplete={setMediaUrls}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/owner/dashboard")}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "List Property"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ListProperty;
