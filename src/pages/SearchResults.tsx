import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Filter, Home } from "lucide-react";
import LocationSearchBox from "@/components/search/LocationSearchBox";

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  amenities: string[];
  rating: number;
  reviews: number;
}

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialLocation = searchParams.get("location") || "";
  
  const [searchLocation, setSearchLocation] = useState(initialLocation);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([2000, 5000]);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const amenitiesList = [
    "Private Rooms",
    "24/7 Staff",
    "Memory Care",
    "Garden",
    "Transportation",
    "Medication Management",
    "Social Activities",
    "Housekeeping"
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockProperties: Property[] = [
          {
            id: "1",
            name: "Sunshine Senior Care",
            location: "San Francisco, CA",
            price: 2800,
            image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
            amenities: ["24/7 Staff", "Private Rooms", "Memory Care", "Garden"],
            rating: 4.8,
            reviews: 45
          },
          {
            id: "2",
            name: "Golden Years Manor",
            location: "Los Angeles, CA",
            price: 3200,
            image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
            amenities: ["Medication Management", "Social Activities", "Gourmet Meals", "Physical Therapy"],
            rating: 4.6,
            reviews: 38
          },
          {
            id: "3",
            name: "Serenity Care Home",
            location: "Seattle, WA",
            price: 2950,
            image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09",
            amenities: ["Beautiful Garden", "Private Bathrooms", "Housekeeping", "Transportation"],
            rating: 4.9,
            reviews: 52
          },
          {
            id: "4",
            name: "Tranquil Gardens Care",
            location: "Portland, OR",
            price: 3100,
            image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
            amenities: ["Transportation", "24/7 Staff", "Meal Service", "Social Activities"],
            rating: 4.7,
            reviews: 29
          },
          {
            id: "5",
            name: "Harmony House",
            location: "San Diego, CA",
            price: 2600,
            image: "https://images.unsplash.com/photo-1577495508048-b635879837f1",
            amenities: ["Private Rooms", "Medication Management", "Housekeeping", "Garden"],
            rating: 4.5,
            reviews: 33
          }
        ];
        
        setProperties(mockProperties);
        setFilteredProperties(mockProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = properties.filter(property => {
      const inPriceRange = property.price >= priceRange[0] && property.price <= priceRange[1];
      
      const hasSelectedAmenities = selectedAmenities.length === 0 || 
        selectedAmenities.some(amenity => property.amenities.includes(amenity));
      
      const matchesLocation = searchLocation === "" || 
        property.location.toLowerCase().includes(searchLocation.toLowerCase());
      
      return inPriceRange && hasSelectedAmenities && matchesLocation;
    });
    
    setFilteredProperties(filtered);
    navigate(`/search?location=${encodeURIComponent(searchLocation)}`);
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  return (
    <div className="container py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <LocationSearchBox
              value={searchLocation}
              onChange={setSearchLocation}
              onSearch={handleSearch}
            />
          </div>
          <Button type="submit">Search</Button>
          <Button 
            type="button" 
            variant={filterOpen ? "default" : "outline"}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </form>

        {filterOpen && (
          <div className="mt-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Price Range ($/month)</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={priceRange}
                    min={1000}
                    max={10000}
                    step={100}
                    onValueChange={setPriceRange}
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>${priceRange[0].toLocaleString()}</span>
                    <span>${priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {amenitiesList.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`amenity-${amenity}`}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <Label htmlFor={`amenity-${amenity}`}>{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {loading ? "Searching..." : `${filteredProperties.length} Care Homes Found`}
        </h2>
      </div>

      {loading && (
        <div className="flex justify-center my-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )}

      {!loading && filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex rounded-full bg-primary-100 p-4">
            <Home size={24} className="text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No care homes found</h3>
          <p className="mt-2 text-gray-600">
            Try adjusting your search filters or exploring a different location
          </p>
          <Button className="mt-6" onClick={() => {
            setSearchLocation("");
            setPriceRange([1000, 10000]);
            setSelectedAmenities([]);
          }}>
            Reset All Filters
          </Button>
        </div>
      )}

      {!loading && filteredProperties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <Card key={property.id} className="overflow-hidden care-card">
              <div className="h-48 w-full relative">
                <img 
                  src={property.image} 
                  alt={property.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white text-care-700">
                    ★ {property.rating} ({property.reviews})
                  </Badge>
                </div>
              </div>
              
              <CardContent className="pt-6">
                <h3 className="font-bold text-xl mb-1">{property.name}</h3>
                <p className="text-gray-600 mb-4">{property.location}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.amenities.slice(0, 3).map(amenity => (
                    <span key={amenity} className="amenity-badge">
                      {amenity}
                    </span>
                  ))}
                  {property.amenities.length > 3 && (
                    <span className="amenity-badge">+{property.amenities.length - 3} more</span>
                  )}
                </div>
                <p className="font-semibold text-lg">
                  ${property.price.toLocaleString()}/month
                </p>
              </CardContent>
              
              <CardFooter className="border-t pt-4">
                <Button 
                  onClick={() => navigate(`/property/${property.id}`)} 
                  className="w-full"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
